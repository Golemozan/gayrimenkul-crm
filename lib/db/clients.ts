import "server-only";
import { db, likePattern, newId, now } from "./index";
import type { Client } from "@/types";

export type ClientInput = Omit<Client, "id" | "created_at">;

export type ClientFilter = { q?: string; stage?: string; looking_for?: string };

function where(f: ClientFilter) {
  const w: string[] = [];
  const a: unknown[] = [];
  if (f.q) {
    w.push(
      `(tr_lower(full_name) LIKE ? ESCAPE '\\' OR phone LIKE ? ESCAPE '\\'
        OR tr_lower(email) LIKE ? ESCAPE '\\')`
    );
    const p = likePattern(f.q);
    a.push(p, p, p);
  }
  if (f.stage) (w.push("stage = ?"), a.push(f.stage));
  if (f.looking_for) {
    w.push(
      `EXISTS (SELECT 1 FROM demands d WHERE d.client_id = clients.id
               AND d.status = 'aktif' AND d.type = ?)`
    );
    a.push(f.looking_for);
  }
  return { sql: w.length ? `WHERE ${w.join(" AND ")}` : "", args: a };
}

export function listClients(f: ClientFilter, page: number, pageSize: number) {
  const { sql, args } = where(f);
  const total = (
    db().prepare(`SELECT COUNT(*) n FROM clients ${sql}`).get(...args) as { n: number }
  ).n;
  const rows = db()
    .prepare(`SELECT * FROM clients ${sql} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .all(...args, pageSize, (page - 1) * pageSize) as Client[];
  return { rows, total };
}

export function allClients() {
  return db().prepare(`SELECT * FROM clients ORDER BY created_at DESC`).all() as Client[];
}

export function getClient(id: string) {
  return (db().prepare(`SELECT * FROM clients WHERE id = ?`).get(id) as Client) ?? null;
}

export function clientOptions() {
  return db()
    .prepare(`SELECT id, full_name FROM clients ORDER BY full_name COLLATE NOCASE`)
    .all() as { id: string; full_name: string }[];
}

export function recentClients(limit: number) {
  return db()
    .prepare(`SELECT * FROM clients ORDER BY created_at DESC LIMIT ?`)
    .all(limit) as Client[];
}

export function countClients() {
  return (db().prepare(`SELECT COUNT(*) n FROM clients`).get() as { n: number }).n;
}

const COLS = [
  "full_name", "phone", "email", "stage", "offer_property_id", "offer_amount", "notes",
] as const;

export function insertClient(i: ClientInput) {
  const id = newId();
  db()
    .prepare(
      `INSERT INTO clients (id, ${COLS.join(", ")}, created_at)
       VALUES (?, ${COLS.map(() => "?").join(", ")}, ?)`
    )
    .run(id, ...COLS.map((c) => i[c] ?? null), now());
  return id;
}

export function updateClient(id: string, i: ClientInput) {
  db()
    .prepare(`UPDATE clients SET ${COLS.map((c) => `${c} = ?`).join(", ")} WHERE id = ?`)
    .run(...COLS.map((c) => i[c] ?? null), id);
}

export function setClientStage(id: string, stage: Client["stage"]) {
  db().prepare(`UPDATE clients SET stage = ? WHERE id = ?`).run(stage, id);
}

export function deleteClient(id: string) {
  db().prepare(`DELETE FROM clients WHERE id = ?`).run(id);
}
