"use server";

import { run } from "@/lib/action";
import { activitySchema } from "@/lib/schemas";
import { deleteActivity as dbDelete, insertActivity } from "@/lib/db/activities";
import { getClient } from "@/lib/db/clients";

export async function addActivity(raw: unknown) {
  return run(() => {
    const a = activitySchema.parse(raw);
    if (!getClient(a.client_id)) throw new Error("Müşteri bulunamadı");
    return insertActivity({ ...a, occurred_at: new Date(a.occurred_at).toISOString() });
  });
}

export async function deleteActivity(id: string) {
  return run(() => {
    dbDelete(id);
    return null;
  });
}
