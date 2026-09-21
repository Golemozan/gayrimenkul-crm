"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input, Select, Textarea } from "@/components/FormFields";
import { Button, Notice } from "@/components/primitives";
import { saveAppointment } from "@/app/actions/appointments";
import { APPOINTMENT_STATUSES } from "@/lib/constants";
import type { Appointment } from "@/types";

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
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setError(null);
    start(async () => {
      const res = await saveAppointment(initial?.id ?? null, {
        client_id: fd.get("client_id") || null,
        property_id: fd.get("property_id") || null,
        date: fd.get("date"),
        time: fd.get("time") || null,
        notes: fd.get("notes"),
        status: fd.get("status"),
      });
      if (!res.ok) return setError(res.error);

      const completed = fd.get("status") === "tamamlandı" && initial?.status !== "tamamlandı";
      toast.success(
        completed && fd.get("client_id")
          ? "Randevu kaydedildi, müşteri geçmişine işlendi"
          : mode === "edit"
            ? "Randevu güncellendi"
            : "Randevu eklendi"
      );
      if (mode === "edit") router.push("/appointments");
      else {
        form.reset();
        onDone?.();
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2">
      <Select name="client_id" label="Müşteri" options={clients} placeholder="Seçiniz" defaultValue={initial?.client_id ?? ""} />
      <Select name="property_id" label="İlan" options={properties} placeholder="Seçiniz" defaultValue={initial?.property_id ?? ""} />
      <Input name="date" label="Tarih" type="date" required defaultValue={initial?.date} />
      <Input name="time" label="Saat" type="time" defaultValue={initial?.time ? initial.time.slice(0, 5) : undefined} />
      <Select name="status" label="Durum" options={APPOINTMENT_STATUSES} defaultValue={initial?.status} />
      <div className="hidden sm:block" />
      <Textarea name="notes" label="Notlar" defaultValue={initial?.notes ?? undefined} className="sm:col-span-2" />

      {error ? <Notice className="sm:col-span-2">{error}</Notice> : null}

      <div className="flex gap-3 sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Kaydediliyor…" : mode === "edit" ? "Güncelle" : "Kaydet"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          İptal
        </Button>
      </div>
    </form>
  );
}
