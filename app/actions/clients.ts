"use server";

import { run } from "@/lib/action";
import { db } from "@/lib/db";
import { clientSchema, demandSchema } from "@/lib/schemas";
import {
  deleteClient as dbDelete,
  getClient,
  insertClient,
  setClientStage,
  updateClient,
} from "@/lib/db/clients";
import { insertDemand } from "@/lib/db/demands";
import { runForDemand } from "@/lib/db/matches";
import { CLIENT_STAGES, type ClientStage } from "@/types";

/** Yeni müşteri; isteğe bağlı ilk talebiyle birlikte (tek transaction). */
export async function createClientWithDemand(rawClient: unknown, rawDemand: unknown | null) {
  return run(() => {
    const client = clientSchema.parse(rawClient);
    const demand = rawDemand
      ? demandSchema.parse({ ...(rawDemand as object), client_id: "pending" })
      : null;

    const { id, demandId } = db().transaction(() => {
      const id = insertClient(client);
      const demandId = demand ? insertDemand({ ...demand, client_id: id }) : null;
      return { id, demandId };
    })();

    return { id, newMatches: demandId ? runForDemand(demandId) : 0 };
  });
}

export async function editClient(id: string, raw: unknown) {
  return run(() => {
    if (!getClient(id)) throw new Error("Müşteri bulunamadı");
    updateClient(id, clientSchema.parse(raw));
    return null;
  });
}

export async function moveClientStage(id: string, stage: ClientStage) {
  return run(() => {
    if (!CLIENT_STAGES.includes(stage)) throw new Error("Geçersiz aşama");
    setClientStage(id, stage);
    return null;
  });
}

export async function deleteClient(id: string) {
  return run(() => {
    dbDelete(id);
    return null;
  });
}
