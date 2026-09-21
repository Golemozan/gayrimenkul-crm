"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { moveClientStage } from "@/app/actions/clients";
import { CLIENT_STAGES, type ClientStage } from "@/types";

export default function StageMover({ id, stage }: { id: string; stage: ClientStage }) {
  const [pending, start] = useTransition();
  const idx = CLIENT_STAGES.indexOf(stage);
  const prev = idx > 0 ? CLIENT_STAGES[idx - 1] : null;
  const next = idx < CLIENT_STAGES.length - 1 ? CLIENT_STAGES[idx + 1] : null;

  function move(to: ClientStage) {
    start(async () => {
      const res = await moveClientStage(id, to);
      if (!res.ok) toast.error(`Taşınamadı: ${res.error}`);
    });
  }

  const btn =
    "flex h-7 w-7 items-center justify-center rounded border transition disabled:opacity-30 border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800";

  return (
    <div className="flex items-center gap-1">
      <button type="button" disabled={pending || !prev} onClick={() => prev && move(prev)} className={btn} aria-label={prev ? `${prev} aşamasına al` : undefined} title={prev ? `← ${prev}` : ""}>
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button type="button" disabled={pending || !next} onClick={() => next && move(next)} className={btn} aria-label={next ? `${next} aşamasına al` : undefined} title={next ? `${next} →` : ""}>
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
