"use server";

import { run } from "@/lib/action";
import { demandSchema } from "@/lib/schemas";
import {
  deleteDemand as dbDelete,
  getDemand,
  insertDemand,
  setDemandStatus,
  updateDemand,
} from "@/lib/db/demands";
import { getClient } from "@/lib/db/clients";
import { runForDemand } from "@/lib/db/matches";
import { DEMAND_STATUSES } from "@/lib/constants";
import type { DemandStatus } from "@/types";

export async function saveDemand(id: string | null, raw: unknown) {
  return run(() => {
    const input = demandSchema.parse(raw);
    if (!getClient(input.client_id)) throw new Error("Müşteri bulunamadı");
    let did: string;
    if (id) {
      if (!getDemand(id)) throw new Error("Talep bulunamadı");
      updateDemand(id, input);
      did = id;
    } else {
      did = insertDemand(input);
    }
    return { id: did, newMatches: runForDemand(did) };
  });
}

export async function changeDemandStatus(id: string, status: DemandStatus) {
  return run(() => {
    if (!DEMAND_STATUSES.includes(status)) throw new Error("Geçersiz durum");
    setDemandStatus(id, status);
    return { newMatches: runForDemand(id) };
  });
}

export async function deleteDemand(id: string) {
  return run(() => {
    dbDelete(id);
    return null;
  });
}
