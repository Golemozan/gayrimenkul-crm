"use server";

import { run } from "@/lib/action";
import { db } from "@/lib/db";
import { appointmentSchema } from "@/lib/schemas";
import {
  deleteAppointment as dbDelete,
  getAppointment,
  insertAppointment,
  updateAppointment,
} from "@/lib/db/appointments";
import { insertActivity } from "@/lib/db/activities";
import type { Appointment } from "@/types";

/** Randevu "tamamlandı"ya geçtiği an müşterinin geçmişine düşer. */
function logIfCompleted(before: Appointment | null, after: Omit<Appointment, "id" | "created_at">) {
  if (after.status !== "tamamlandı" || before?.status === "tamamlandı" || !after.client_id)
    return;
  const when = new Date(`${after.date}T${after.time ?? "12:00"}`);
  insertActivity({
    client_id: after.client_id,
    property_id: after.property_id,
    kind: after.property_id ? "yer gösterme" : "görüşme",
    body: after.notes ? `Randevu tamamlandı — ${after.notes}` : "Randevu tamamlandı",
    occurred_at: Number.isNaN(when.getTime()) ? undefined : when.toISOString(),
  });
}

export async function saveAppointment(id: string | null, raw: unknown) {
  return run(() => {
    const input = appointmentSchema.parse(raw);
    return db().transaction(() => {
      if (id) {
        const before = getAppointment(id);
        if (!before) throw new Error("Randevu bulunamadı");
        updateAppointment(id, input);
        logIfCompleted(before, input);
        return id;
      }
      const nid = insertAppointment(input);
      logIfCompleted(null, input);
      return nid;
    })();
  });
}

export async function deleteAppointment(id: string) {
  return run(() => {
    dbDelete(id);
    return null;
  });
}
