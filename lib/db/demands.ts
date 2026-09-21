import "server-only";
import { db, newId, now, parseList, toJson } from "./index";
import type { Demand, PropertyKind } from "@/types";

type Row = Omit<Demand, "property_types" | "districts" | "features"> & {
  property_types: string;
  districts: string;
  features: string;
};

const fromRow = (r: Row): Demand => ({
  ...r,
  property_types: parseList<PropertyKind>(r.property_types),
  districts: parseList(r.districts),
  features: parseList(r.features),
});

export type DemandInput = Omit<Demand, "id" | "created_at">;

export function getDemand(id: string) {
  const r = db().prepare(`SELECT * FROM demands WHERE id = ?`).get(id) as Row | undefined;
  return r ? fromRow(r) : null;
}

export function demandsForClient(clientId: string) {
  return (
    db()
      .prepare(
        `SELECT * FROM demands WHERE client_id = ?
         ORDER BY status = 'aktif' DESC, created_at DESC`
      )
      .all(clientId) as Row[]
  ).map(fromRow);
}

export function activeDemands() {
  return (
    db().prepare(`SELECT * FROM demands WHERE status = 'aktif'`).all() as Row[]
  ).map(fromRow);
}

/** Müşteri listesi için: müşteri başına aktif taleplerin özeti. */
export function activeDemandsByClient(clientIds: string[]) {
  if (clientIds.length === 0) return new Map<string, Demand[]>();
  const rows = db()
    .prepare(
      `SELECT * FROM demands WHERE status = 'aktif'
       AND client_id IN (${clientIds.map(() => "?").join(",")})
       ORDER BY created_at DESC`
    )
    .all(...clientIds) as Row[];
  const m = new Map<string, Demand[]>();
  for (const r of rows) {
    const d = fromRow(r);
    m.set(d.client_id, [...(m.get(d.client_id) ?? []), d]);
  }
  return m;
}

export function allDemandsWithClient() {
  return (
    db()
      .prepare(
        `SELECT d.*, c.full_name FROM demands d JOIN clients c ON c.id = d.client_id
         ORDER BY d.created_at DESC`
      )
      .all() as (Row & { full_name: string })[]
  ).map((r) => ({ ...fromRow(r), full_name: r.full_name }));
}

const COLS = [
  "client_id", "type", "property_types", "city", "districts", "budget_min",
  "budget_max", "currency", "rooms_min", "area_min", "area_max", "features",
  "status", "notes",
] as const;

function values(i: DemandInput) {
  return COLS.map((c) => {
    const v = i[c];
    return Array.isArray(v) ? toJson(v) : (v ?? null);
  });
}

export function insertDemand(i: DemandInput) {
  const id = newId();
  db()
    .prepare(
      `INSERT INTO demands (id, ${COLS.join(", ")}, created_at)
       VALUES (?, ${COLS.map(() => "?").join(", ")}, ?)`
    )
    .run(id, ...values(i), now());
  return id;
}

export function updateDemand(id: string, i: DemandInput) {
  db()
    .prepare(`UPDATE demands SET ${COLS.map((c) => `${c} = ?`).join(", ")} WHERE id = ?`)
    .run(...values(i), id);
}

export function setDemandStatus(id: string, status: Demand["status"]) {
  db().prepare(`UPDATE demands SET status = ? WHERE id = ?`).run(status, id);
}

export function deleteDemand(id: string) {
  db().prepare(`DELETE FROM demands WHERE id = ?`).run(id);
}
