"use server";

import { run } from "@/lib/action";
import { db } from "@/lib/db";
import { getMatchView, markAllSeen, setMatchStatus } from "@/lib/db/matches";
import { insertActivity } from "@/lib/db/activities";
import { getClient, setClientStage } from "@/lib/db/clients";
import { MATCH_STATUSES } from "@/lib/constants";
import type { MatchStatus } from "@/types";

/**
 * Eşleşme üzerinde işlem. Müşteriye dokunan her adım aktivite geçmişine düşer;
 * "ilgileniyor" ilk kez gelince huni "yeni"den "ilgili"ye kayar.
 */
export async function updateMatch(id: string, status: MatchStatus) {
  return run(() => {
    if (!MATCH_STATUSES.includes(status)) throw new Error("Geçersiz durum");
    const m = getMatchView(id);
    if (!m) throw new Error("Eşleşme bulunamadı");

    db().transaction(() => {
      setMatchStatus(id, status);
      if (status === "iletildi") {
        insertActivity({
          client_id: m.client_id,
          property_id: m.property_id,
          kind: "mesaj",
          body: `İlan WhatsApp'tan iletildi: ${m.property_title}`,
        });
      } else if (status === "ilgileniyor" || status === "ilgilenmedi") {
        insertActivity({
          client_id: m.client_id,
          property_id: m.property_id,
          kind: "not",
          body: `${status === "ilgileniyor" ? "İlgileniyor" : "İlgilenmedi"}: ${m.property_title}`,
        });
        if (status === "ilgileniyor" && getClient(m.client_id)?.stage === "yeni")
          setClientStage(m.client_id, "ilgili");
      }
    })();
    return null;
  });
}

export async function markMatchesSeen() {
  return run(() => {
    markAllSeen();
    return null;
  });
}
