import "server-only";
import { db } from "./index";

// Panel metrikleri. Hepsi gerçek kayıtlardan; dönem = son N gün, "önceki
// dönem" = ondan önceki N gün. Gün sınırları yerel saatle.

export type Period = { days: number; from: Date; to: Date; prevFrom: Date };

export function period(days: number): Period {
  const to = new Date();
  const from = new Date(to);
  from.setHours(0, 0, 0, 0);
  from.setDate(from.getDate() - (days - 1));
  const prevFrom = new Date(from);
  prevFrom.setDate(prevFrom.getDate() - days);
  return { days, from, to, prevFrom };
}

const iso = (d: Date) => d.toISOString();
const localDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

type Table = "properties" | "clients" | "matches" | "demands";

function countBetween(table: Table, from: Date, to: Date) {
  return (
    db()
      .prepare(`SELECT COUNT(*) n FROM ${table} WHERE created_at >= ? AND created_at < ?`)
      .get(iso(from), iso(to)) as { n: number }
  ).n;
}

export type Kpi = { current: number; previous: number };

export function kpis(p: Period) {
  const k = (t: Table): Kpi => ({
    current: countBetween(t, p.from, p.to),
    previous: countBetween(t, p.prevFrom, p.from),
  });
  const appts = (from: Date, to: Date) =>
    (
      db()
        .prepare(`SELECT COUNT(*) n FROM appointments WHERE date >= ? AND date < ?`)
        .get(localDay(from), localDay(to)) as { n: number }
    ).n;
  const tomorrow = new Date(p.to);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return {
    properties: k("properties"),
    clients: k("clients"),
    matches: k("matches"),
    appointments: { current: appts(p.from, tomorrow), previous: appts(p.prevFrom, p.from) },
  };
}

/** Günlük yeni eşleşme — bu dönem ve bir önceki dönem, gün gün hizalı. */
export function matchSeries(p: Period) {
  const rows = db()
    .prepare(`SELECT created_at FROM matches WHERE created_at >= ?`)
    .all(iso(p.prevFrom)) as { created_at: string }[];

  const byDay = new Map<string, number>();
  for (const r of rows) {
    const k = localDay(new Date(r.created_at));
    byDay.set(k, (byDay.get(k) ?? 0) + 1);
  }

  return Array.from({ length: p.days }, (_, i) => {
    const d = new Date(p.from);
    d.setDate(d.getDate() + i);
    const prev = new Date(p.prevFrom);
    prev.setDate(prev.getDate() + i);
    return {
      day: localDay(d),
      current: byDay.get(localDay(d)) ?? 0,
      previous: byDay.get(localDay(prev)) ?? 0,
    };
  });
}

/** Huni özetini üç gruba indirir (referanstaki üç segment). */
export function stageGroups() {
  const rows = db().prepare(`SELECT stage, COUNT(*) n FROM clients GROUP BY stage`).all() as {
    stage: string;
    n: number;
  }[];
  const n = (...s: string[]) => rows.filter((r) => s.includes(r.stage)).reduce((a, r) => a + r.n, 0);
  return { aday: n("yeni", "ilgili"), surecte: n("görüştü", "teklif"), kazanilan: n("kazanıldı") };
}

/** Dönem içinde müşteriyle temas (aktivite + randevu) — haftanın gününe göre. Pzt=0. */
export function weekdayLoad(p: Period) {
  const counts = [0, 0, 0, 0, 0, 0, 0];
  const acts = db()
    .prepare(`SELECT occurred_at t FROM activities WHERE occurred_at >= ? AND occurred_at <= ?`)
    .all(iso(p.from), iso(p.to)) as { t: string }[];
  for (const a of acts) counts[(new Date(a.t).getDay() + 6) % 7]++;
  const appts = db()
    .prepare(`SELECT date FROM appointments WHERE status <> 'iptal' AND date >= ? AND date <= ?`)
    .all(localDay(p.from), localDay(p.to)) as { date: string }[];
  for (const a of appts) counts[(new Date(`${a.date}T12:00`).getDay() + 6) % 7]++;
  return counts;
}

/** Aktif taleplerin kaçına en az bir canlı eşleşme var. */
export function demandCoverage() {
  const r = db()
    .prepare(
      `SELECT COUNT(*) total,
              SUM(EXISTS (SELECT 1 FROM matches m WHERE m.demand_id = d.id
                          AND m.status <> 'ilgilenmedi')) covered
       FROM demands d WHERE d.status = 'aktif'`
    )
    .get() as { total: number; covered: number | null };
  return { total: r.total, covered: r.covered ?? 0 };
}

export type TopProperty = {
  id: string;
  title: string;
  image_url: string | null;
  price: number;
  currency: "TRY" | "USD" | "EUR";
  district: string | null;
  matches: number;
  avg_score: number;
};

/** En çok talebe uyan aktif ilanlar. */
export function topMatchedProperties(limit: number) {
  return db()
    .prepare(
      `SELECT p.id, p.title, p.image_url, p.price, p.currency, p.district,
              COUNT(m.id) matches, ROUND(AVG(m.score)) avg_score
       FROM properties p JOIN matches m ON m.property_id = p.id
       WHERE p.status = 'aktif' AND m.status <> 'ilgilenmedi'
       GROUP BY p.id ORDER BY matches DESC, avg_score DESC LIMIT ?`
    )
    .all(limit) as TopProperty[];
}
