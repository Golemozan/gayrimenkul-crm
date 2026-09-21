import "server-only";
import { db, newId, now } from "./index";
import type { Appointment } from "@/types";

export type AppointmentInput = Omit<Appointment, "id" | "created_at">;
export type AppointmentView = Appointment & {
  client_name: string | null;
  property_title: string | null;
};

const VIEW = `
  SELECT a.*, c.full_name client_name, p.title property_title FROM appointments a
  LEFT JOIN clients c ON c.id = a.client_id
  LEFT JOIN properties p ON p.id = a.property_id`;

export function listAppointments() {
  // Önce bekleyenler (yakın tarih önce), sonra geçmiş/kapanmış olanlar.
  return db()
    .prepare(
      `${VIEW} ORDER BY a.status <> 'bekliyor',
         CASE WHEN a.status = 'bekliyor' THEN a.date END ASC,
         a.date DESC, a.time`
    )
    .all() as AppointmentView[];
}

export function appointmentsForClient(clientId: string) {
  return db()
    .prepare(`${VIEW} WHERE a.client_id = ? ORDER BY a.date DESC, a.time DESC`)
    .all(clientId) as AppointmentView[];
}

export function upcomingAppointments(limit: number) {
  const today = new Date().toISOString().slice(0, 10);
  return db()
    .prepare(
      `${VIEW} WHERE a.status = 'bekliyor' AND a.date >= ? ORDER BY a.date, a.time LIMIT ?`
    )
    .all(today, limit) as AppointmentView[];
}

export function countAppointmentsBetween(from: string, to: string) {
  return (
    db()
      .prepare(`SELECT COUNT(*) n FROM appointments WHERE date >= ? AND date < ?`)
      .get(from, to) as { n: number }
  ).n;
}

export function getAppointment(id: string) {
  return (db().prepare(`SELECT * FROM appointments WHERE id = ?`).get(id) as Appointment) ?? null;
}

const COLS = ["client_id", "property_id", "date", "time", "notes", "status"] as const;

export function insertAppointment(i: AppointmentInput) {
  const id = newId();
  db()
    .prepare(
      `INSERT INTO appointments (id, ${COLS.join(", ")}, created_at)
       VALUES (?, ${COLS.map(() => "?").join(", ")}, ?)`
    )
    .run(id, ...COLS.map((c) => i[c] ?? null), now());
  return id;
}

export function updateAppointment(id: string, i: AppointmentInput) {
  db()
    .prepare(`UPDATE appointments SET ${COLS.map((c) => `${c} = ?`).join(", ")} WHERE id = ?`)
    .run(...COLS.map((c) => i[c] ?? null), id);
}

export function deleteAppointment(id: string) {
  db().prepare(`DELETE FROM appointments WHERE id = ?`).run(id);
}
