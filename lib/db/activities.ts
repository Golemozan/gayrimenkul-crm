import "server-only";
import { db, newId, now } from "./index";
import type { Activity, ActivityKind } from "@/types";

export type ActivityView = Activity & { property_title: string | null };

export function activitiesForClient(clientId: string) {
  return db()
    .prepare(
      `SELECT a.*, p.title property_title FROM activities a
       LEFT JOIN properties p ON p.id = a.property_id
       WHERE a.client_id = ? ORDER BY a.occurred_at DESC, a.created_at DESC`
    )
    .all(clientId) as ActivityView[];
}

export function recentActivities(limit: number) {
  return db()
    .prepare(
      `SELECT a.*, p.title property_title, c.full_name client_name FROM activities a
       JOIN clients c ON c.id = a.client_id
       LEFT JOIN properties p ON p.id = a.property_id
       ORDER BY a.occurred_at DESC, a.created_at DESC LIMIT ?`
    )
    .all(limit) as (ActivityView & { client_name: string })[];
}

export function insertActivity(i: {
  client_id: string;
  property_id?: string | null;
  kind: ActivityKind;
  body?: string | null;
  occurred_at?: string;
}) {
  const id = newId();
  const t = now();
  db()
    .prepare(
      `INSERT INTO activities (id, client_id, property_id, kind, body, occurred_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(id, i.client_id, i.property_id ?? null, i.kind, i.body ?? null, i.occurred_at ?? t, t);
  return id;
}

export function deleteActivity(id: string) {
  const r = db().prepare(`SELECT client_id FROM activities WHERE id = ?`).get(id) as
    | { client_id: string }
    | undefined;
  db().prepare(`DELETE FROM activities WHERE id = ?`).run(id);
  return r?.client_id ?? null;
}
