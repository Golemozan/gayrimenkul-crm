"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CLIENT_STAGES, type ClientStage } from "@/types";

export default function StageMover({
  id,
  stage,
}: {
  id: string;
  stage: ClientStage;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const idx = CLIENT_STAGES.indexOf(stage);
  const prev = idx > 0 ? CLIENT_STAGES[idx - 1] : null;
  const next = idx < CLIENT_STAGES.length - 1 ? CLIENT_STAGES[idx + 1] : null;

  async function move(to: ClientStage) {
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("clients")
      .update({ stage: to })
      .eq("id", id);
    setBusy(false);
    if (error) {
      window.alert(`Taşınamadı: ${error.message}`);
      return;
    }
    router.refresh();
  }

  const btn =
    "flex h-6 w-6 items-center justify-center rounded border text-xs transition disabled:opacity-30 border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800";

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        disabled={busy || !prev}
        onClick={() => prev && move(prev)}
        className={btn}
        title={prev ? `← ${prev}` : ""}
      >
        ‹
      </button>
      <button
        type="button"
        disabled={busy || !next}
        onClick={() => next && move(next)}
        className={btn}
        title={next ? `${next} →` : ""}
      >
        ›
      </button>
    </div>
  );
}
