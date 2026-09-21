"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import DemandFields, { draftFrom, draftToPayload } from "@/components/DemandFields";
import { Button, Notice } from "@/components/primitives";
import { saveDemand } from "@/app/actions/demands";
import { notifyMatches } from "@/lib/notify";
import type { Demand } from "@/types";

/** Müşteri detayında: yeni talep ekle veya mevcut talebi düzenle. */
export default function DemandForm({
  clientId,
  initial,
  onClose,
}: {
  clientId: string;
  initial?: Demand;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(() => draftFrom(initial));
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await saveDemand(initial?.id ?? null, draftToPayload(draft, clientId));
      if (!res.ok) {
        setError(res.error);
        return;
      }
      toast.success(initial ? "Talep güncellendi" : "Talep eklendi");
      notifyMatches(res.data.newMatches, "talep");
      onClose();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <DemandFields value={draft} onChange={setDraft} showStatus={!!initial} />
      {error ? <Notice>{error}</Notice> : null}
      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Kaydediliyor…" : initial ? "Talebi güncelle" : "Talebi kaydet"}
        </Button>
        <Button type="button" variant="secondary" onClick={onClose}>
          İptal
        </Button>
      </div>
    </form>
  );
}

export function AddDemandButton({ clientId }: { clientId: string }) {
  const [open, setOpen] = useState(false);
  if (open) return <DemandForm clientId={clientId} onClose={() => setOpen(false)} />;
  return (
    <Button variant="secondary" onClick={() => setOpen(true)}>
      <Plus className="h-4 w-4" />
      Talep ekle
    </Button>
  );
}
