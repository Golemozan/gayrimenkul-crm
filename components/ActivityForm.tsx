"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Select, Textarea } from "@/components/FormFields";
import { Button, Notice } from "@/components/primitives";
import { addActivity } from "@/app/actions/activities";
import { ACTIVITY_KINDS } from "@/lib/constants";

type Option = { value: string; label: string };

/** Yerel saatle "şimdi" — datetime-local input'unun beklediği biçim. */
function localNow() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default function ActivityForm({ clientId, properties }: { clientId: string; properties: Option[] }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  // Sunucu başka saat diliminde render ederse değer tutmaz: tarayıcıda doldur.
  const [when, setWhen] = useState("");
  useEffect(() => setWhen(localNow()), []);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setError(null);
    start(async () => {
      const res = await addActivity({
        client_id: clientId,
        kind: fd.get("kind"),
        property_id: String(fd.get("property_id") ?? "") || null,
        body: String(fd.get("body") ?? ""),
        // datetime-local saat dilimi taşımaz; tarayıcının yerel saatiyle yorumla.
        occurred_at: new Date(when).toISOString(),
      });
      if (!res.ok) return setError(res.error);
      toast.success("Aktivite eklendi");
      form.reset();
      setWhen(localNow());
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-3">
      <Select name="kind" label="Tür" options={ACTIVITY_KINDS} />
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-slate-600 dark:text-slate-300">Zaman</span>
        <input
          type="datetime-local"
          value={when}
          onChange={(e) => setWhen(e.target.value)}
          required
          className="min-h-9 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      </label>
      <Select name="property_id" label="İlgili ilan" options={properties} placeholder="Yok" />
      <Textarea name="body" label="Ne konuşuldu?" placeholder="örn. Kadıköy'deki daireyi beğendi, eşiyle tekrar görmek istiyor." className="sm:col-span-3" />
      {error ? <Notice className="sm:col-span-3">{error}</Notice> : null}
      <div className="sm:col-span-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Ekleniyor…" : "Aktivite ekle"}
        </Button>
      </div>
    </form>
  );
}
