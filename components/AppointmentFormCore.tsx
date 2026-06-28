"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input, Select, Textarea } from "@/components/FormFields";
import type { Appointment, AppointmentStatus } from "@/types";

const statuses: AppointmentStatus[] = ["bekliyor", "tamamlandı", "iptal"];

type Option = { value: string; label: string };

export default function AppointmentFormCore({
  mode,
  initial,
  clients,
  properties,
  onDone,
  onCancel,
}: {
  mode: "create" | "edit";
  initial?: Appointment;
  clients: Option[];
  properties: Option[];
  onDone?: () => void;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const fd = new FormData(form);
    const supabase = createClient();

    const payload = {
      client_id: (fd.get("client_id") as string) || null,
      property_id: (fd.get("property_id") as string) || null,
      date: String(fd.get("date")),
      time: (fd.get("time") as string) || null,
      notes: (fd.get("notes") as string) || null,
      status: fd.get("status") as AppointmentStatus,
    };

    const { error } =
      mode === "edit" && initial
        ? await supabase
            .from("appointments")
            .update(payload)
            .eq("id", initial.id)
        : await supabase.from("appointments").insert(payload);

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }

    if (mode === "edit") {
      router.push("/appointments");
      router.refresh();
    } else {
      form.reset();
      router.refresh();
      onDone?.();
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2"
    >
      <Select
        name="client_id"
        label="Müşteri"
        options={clients}
        placeholder="Seçiniz"
        defaultValue={initial?.client_id ?? ""}
      />
      <Select
        name="property_id"
        label="İlan"
        options={properties}
        placeholder="Seçiniz"
        defaultValue={initial?.property_id ?? ""}
      />
      <Input
        name="date"
        label="Tarih"
        type="date"
        required
        defaultValue={initial?.date}
      />
      <Input
        name="time"
        label="Saat"
        type="time"
        defaultValue={initial?.time ? initial.time.slice(0, 5) : undefined}
      />
      <Select
        name="status"
        label="Durum"
        options={statuses}
        defaultValue={initial?.status}
      />
      <div className="hidden sm:block" />
      <Textarea
        name="notes"
        label="Notlar"
        defaultValue={initial?.notes ?? undefined}
        className="sm:col-span-2"
      />

      {error ? (
        <p className="text-sm text-rose-600 dark:text-rose-400 sm:col-span-2">
          {error}
        </p>
      ) : null}

      <div className="flex gap-3 sm:col-span-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
        >
          {loading
            ? "Kaydediliyor..."
            : mode === "edit"
              ? "Güncelle"
              : "Kaydet"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          İptal
        </button>
      </div>
    </form>
  );
}
