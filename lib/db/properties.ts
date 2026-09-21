import "server-only";
import { db, likePattern, newId, now, parseList, toJson } from "./index";
import type { Property } from "@/types";

type Row = Omit<Property, "images" | "features"> & {
  images: string;
  features: string;
};

const fromRow = (r: Row): Property => ({
  ...r,
  images: parseList(r.images),
  features: parseList(r.features),
});

export type PropertyInput = Omit<Property, "id" | "created_at">;

export type PropertyFilter = {
  q?: string;
  type?: string;
  property_type?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
};

function where(f: PropertyFilter) {
  const w: string[] = [];
  const a: unknown[] = [];
  if (f.q) {
    w.push(
      `(tr_lower(title) LIKE ? ESCAPE '\\' OR tr_lower(city) LIKE ? ESCAPE '\\'
        OR tr_lower(district) LIKE ? ESCAPE '\\' OR tr_lower(owner_name) LIKE ? ESCAPE '\\')`
    );
    const p = likePattern(f.q);
    a.push(p, p, p, p);
  }
  if (f.type) (w.push("type = ?"), a.push(f.type));
  if (f.property_type) (w.push("property_type = ?"), a.push(f.property_type));
  if (f.status) (w.push("status = ?"), a.push(f.status));
  if (f.minPrice != null) (w.push("price >= ?"), a.push(f.minPrice));
  if (f.maxPrice != null) (w.push("price <= ?"), a.push(f.maxPrice));
  return { sql: w.length ? `WHERE ${w.join(" AND ")}` : "", args: a };
}

export function listProperties(f: PropertyFilter, page: number, pageSize: number) {
  const { sql, args } = where(f);
  const total = (
    db().prepare(`SELECT COUNT(*) n FROM properties ${sql}`).get(...args) as { n: number }
  ).n;
  const rows = db()
    .prepare(
      `SELECT * FROM properties ${sql} ORDER BY created_at DESC LIMIT ? OFFSET ?`
    )
    .all(...args, pageSize, (page - 1) * pageSize) as Row[];
  return { rows: rows.map(fromRow), total };
}

export function allProperties() {
  return (
    db().prepare(`SELECT * FROM properties ORDER BY created_at DESC`).all() as Row[]
  ).map(fromRow);
}

export function activeProperties() {
  return (
    db().prepare(`SELECT * FROM properties WHERE status = 'aktif'`).all() as Row[]
  ).map(fromRow);
}

export function getProperty(id: string) {
  const r = db().prepare(`SELECT * FROM properties WHERE id = ?`).get(id) as Row | undefined;
  return r ? fromRow(r) : null;
}

export function propertyOptions() {
  return db()
    .prepare(`SELECT id, title FROM properties ORDER BY created_at DESC`)
    .all() as { id: string; title: string }[];
}

export function recentProperties(limit: number) {
  return (
    db()
      .prepare(`SELECT * FROM properties ORDER BY created_at DESC LIMIT ?`)
      .all(limit) as Row[]
  ).map(fromRow);
}

export function propertyStats() {
  return db()
    .prepare(`SELECT status, type, COUNT(*) n FROM properties GROUP BY status, type`)
    .all() as { status: Property["status"]; type: Property["type"]; n: number }[];
}

const COLS = [
  "title", "type", "property_type", "price", "currency", "rooms", "area_m2",
  "location", "district", "city", "description", "image_url", "images",
  "features", "listing_url", "owner_name", "owner_phone", "status",
] as const;

function values(i: PropertyInput) {
  return COLS.map((c) =>
    c === "images" || c === "features" ? toJson(i[c]) : (i[c] ?? null)
  );
}

export function insertProperty(i: PropertyInput) {
  const id = newId();
  db()
    .prepare(
      `INSERT INTO properties (id, ${COLS.join(", ")}, created_at)
       VALUES (?, ${COLS.map(() => "?").join(", ")}, ?)`
    )
    .run(id, ...values(i), now());
  return id;
}

export function updateProperty(id: string, i: PropertyInput) {
  db()
    .prepare(
      `UPDATE properties SET ${COLS.map((c) => `${c} = ?`).join(", ")} WHERE id = ?`
    )
    .run(...values(i), id);
}

export function deleteProperty(id: string) {
  const p = getProperty(id);
  db().prepare(`DELETE FROM properties WHERE id = ?`).run(id);
  return p;
}
