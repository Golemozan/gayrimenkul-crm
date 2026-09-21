import "server-only";
import { db, newId, now, parseList, toJson } from "./index";
import { evaluate } from "@/lib/matching";
import { activeProperties, getProperty } from "./properties";
import { activeDemands, getDemand } from "./demands";
import type { Currency, Match, MatchStatus } from "@/types";

type Row = Omit<Match, "reasons" | "misses"> & { reasons: string; misses: string };

const fromRow = (r: Row): Match => ({
  ...r,
  reasons: parseList(r.reasons),
  misses: parseList(r.misses),
});

// ---------------------------------------------------------------------------
// Motoru çalıştır — ilan veya talep kaydedildikten hemen sonra çağrılır.
// ---------------------------------------------------------------------------

type Pair = { demandId: string; propertyId: string };

function upsert(pairs: (Pair & { result: ReturnType<typeof evaluate> })[], trigger: Match["trigger"]) {
  const conn = db();
  const existing = conn.prepare(
    `SELECT 1 FROM matches WHERE demand_id = ? AND property_id = ?`
  );
  const up = conn.prepare(
    `INSERT INTO matches (id, demand_id, property_id, score, reasons, misses, "trigger",
                          status, seen_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'yeni', NULL, ?, ?)
     ON CONFLICT (demand_id, property_id) DO UPDATE SET
       score = excluded.score, reasons = excluded.reasons,
       misses = excluded.misses, updated_at = excluded.updated_at`
  );
  // Artık uymayan eşleşme düşer — ama emlakçı üzerinde işlem yaptıysa kalır.
  const drop = conn.prepare(
    `DELETE FROM matches WHERE demand_id = ? AND property_id = ? AND status = 'yeni'`
  );

  let created = 0;
  conn.transaction(() => {
    for (const { demandId, propertyId, result } of pairs) {
      if (result.match) {
        if (!existing.get(demandId, propertyId)) created++;
        const t = now();
        up.run(
          newId(), demandId, propertyId, result.score,
          toJson(result.reasons), toJson(result.misses), trigger, t, t
        );
      } else {
        drop.run(demandId, propertyId);
      }
    }
  })();
  return created;
}

/** İlan eklendi/güncellendi → tüm aktif taleplere karşı. Yeni eşleşme sayısını döner. */
export function runForProperty(propertyId: string) {
  const property = getProperty(propertyId);
  if (!property) return 0;
  // Pasif/satıldı ilanın tüm "yeni" eşleşmeleri de düşmeli: tüm talepler taranır.
  const demands = db()
    .prepare(`SELECT id FROM demands`)
    .all() as { id: string }[];
  const active = new Map(activeDemands().map((d) => [d.id, d]));
  return upsert(
    demands.map(({ id }) => {
      const demand = active.get(id);
      return {
        demandId: id,
        propertyId,
        result: demand
          ? evaluate({ property, demand })
          : ({ match: false, rejected: "talep aktif değil" } as const),
      };
    }),
    "ilan"
  );
}

/** Talep eklendi/güncellendi → tüm aktif ilanlara karşı. */
export function runForDemand(demandId: string) {
  const demand = getDemand(demandId);
  if (!demand) return 0;
  const props = activeProperties();
  // Eski eşleşmesi olup artık aktif olmayan ilanları da temizle.
  const stale = (
    db()
      .prepare(
        `SELECT property_id FROM matches m JOIN properties p ON p.id = m.property_id
         WHERE m.demand_id = ? AND p.status <> 'aktif'`
      )
      .all(demandId) as { property_id: string }[]
  ).map((r) => ({
    demandId,
    propertyId: r.property_id,
    result: { match: false, rejected: "ilan aktif değil" } as const,
  }));
  return upsert(
    [
      ...props.map((property) => ({
        demandId,
        propertyId: property.id,
        result: evaluate({ property, demand }),
      })),
      ...stale,
    ],
    "talep"
  );
}

// ---------------------------------------------------------------------------
// Okuma
// ---------------------------------------------------------------------------

export type MatchView = Match & {
  client_id: string;
  client_name: string;
  client_phone: string | null;
  demand_type: string;
  property_title: string;
  property_price: number;
  property_currency: Currency;
  property_rooms: string | null;
  property_area: number | null;
  property_city: string | null;
  property_district: string | null;
  property_image: string | null;
  property_listing_url: string | null;
};

const VIEW = `
  SELECT m.*, c.id client_id, c.full_name client_name, c.phone client_phone,
         d.type demand_type,
         p.title property_title, p.price property_price, p.currency property_currency,
         p.rooms property_rooms, p.area_m2 property_area, p.city property_city,
         p.district property_district, p.image_url property_image,
         p.listing_url property_listing_url
  FROM matches m
  JOIN demands d    ON d.id = m.demand_id
  JOIN clients c    ON c.id = d.client_id
  JOIN properties p ON p.id = m.property_id`;

const view = (r: Row & Record<string, unknown>) => fromRow(r) as MatchView;

export function listMatches(filter: "yeni" | "tümü") {
  const where =
    filter === "yeni" ? `WHERE m.status = 'yeni'` : "";
  return (
    db()
      .prepare(`${VIEW} ${where} ORDER BY m.seen_at IS NOT NULL, m.created_at DESC LIMIT 200`)
      .all() as (Row & Record<string, unknown>)[]
  ).map(view);
}

export function matchesForClient(clientId: string) {
  return (
    db()
      .prepare(`${VIEW} WHERE c.id = ? ORDER BY m.score DESC, m.created_at DESC`)
      .all(clientId) as (Row & Record<string, unknown>)[]
  ).map(view);
}

export function matchesForProperty(propertyId: string) {
  return (
    db()
      .prepare(`${VIEW} WHERE p.id = ? ORDER BY m.score DESC`)
      .all(propertyId) as (Row & Record<string, unknown>)[]
  ).map(view);
}

export function getMatchView(id: string) {
  const r = db().prepare(`${VIEW} WHERE m.id = ?`).get(id) as
    | (Row & Record<string, unknown>)
    | undefined;
  return r ? view(r) : null;
}

export function unseenCount() {
  return (
    db().prepare(`SELECT COUNT(*) n FROM matches WHERE seen_at IS NULL`).get() as {
      n: number;
    }
  ).n;
}

export function countMatchesByStatus(status: MatchStatus) {
  return (
    db().prepare(`SELECT COUNT(*) n FROM matches WHERE status = ?`).get(status) as {
      n: number;
    }
  ).n;
}

// ---------------------------------------------------------------------------
// Yazma
// ---------------------------------------------------------------------------

export function markAllSeen() {
  db().prepare(`UPDATE matches SET seen_at = ? WHERE seen_at IS NULL`).run(now());
}

export function setMatchStatus(id: string, status: MatchStatus) {
  db()
    .prepare(
      `UPDATE matches SET status = ?, seen_at = COALESCE(seen_at, ?), updated_at = ? WHERE id = ?`
    )
    .run(status, now(), now(), id);
}
