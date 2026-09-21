"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import DemandForm from "@/components/DemandForm";
import DeleteButton from "@/components/DeleteButton";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/primitives";
import { changeDemandStatus } from "@/app/actions/demands";
import { notifyMatches } from "@/lib/notify";
import { demandSummary } from "@/lib/demandText";
import { cn } from "@/lib/utils";
import type { Demand, DemandStatus } from "@/types";

export default function DemandCard({ demand: d, matchCount }: { demand: Demand; matchCount: number }) {
  const [editing, setEditing] = useState(false);
  const [pending, start] = useTransition();

  if (editing) return <DemandForm clientId={d.client_id} initial={d} onClose={() => setEditing(false)} />;

  function setStatus(s: DemandStatus) {
    start(async () => {
      const res = await changeDemandStatus(d.id, s);
      if (!res.ok) return void toast.error(res.error);
      toast.success(s === "aktif" ? "Talep yeniden aktif" : `Talep: ${s}`);
      notifyMatches(res.data.newMatches, "talep");
    });
  }

  return (
    <div className={cn("rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900", d.status !== "aktif" && "opacity-70")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge value={d.type} />
            <StatusBadge value={d.status} />
            <span className="text-xs text-slate-400">{matchCount} eşleşme</span>
          </div>
          <p className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">{demandSummary(d)}</p>
          {d.features.length ? (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">İstenen: {d.features.join(", ")}</p>
          ) : null}
          {d.notes ? <p className="mt-1 text-xs italic text-slate-500 dark:text-slate-400">{d.notes}</p> : null}
        </div>
        <div className="flex items-center gap-1">
          {d.status === "aktif" ? (
            <>
              <Button variant="ghost" disabled={pending} onClick={() => setStatus("karşılandı")} title="Müşteri aradığını buldu">
                Karşılandı
              </Button>
              <Button variant="ghost" disabled={pending} onClick={() => setStatus("pasif")}>
                Durdur
              </Button>
            </>
          ) : (
            <Button variant="ghost" disabled={pending} onClick={() => setStatus("aktif")}>
              Aktifleştir
            </Button>
          )}
          <Button variant="ghost" onClick={() => setEditing(true)} aria-label="Talebi düzenle">
            <Pencil className="h-4 w-4" />
          </Button>
          <DeleteButton kind="demand" id={d.id} label="Sil" className="px-2" confirmText="Bu talep ve eşleşmeleri silinsin mi?" />
        </div>
      </div>
    </div>
  );
}
