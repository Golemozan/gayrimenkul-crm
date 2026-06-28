"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input, Select, Textarea } from "@/components/FormFields";
import { CLIENT_STAGES, type ClientStage, type ListingType } from "@/types";

const lookingFor: ListingType[] = ["satılık", "kiralık"];

type Option = { value: string; label: string };

export default function ClientForm({
  properties = [],
}: {
  properties?: Option[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const supabase = createClient();

    const { error } = await supabase.from("clients").insert({
      full_name: String(fd.get("full_name")),
      phone: (fd.get("phone") as string) || null,
      email: (fd.get("email") as string) || null,
      budget_min: fd.get("budget_min") ? Number(fd.get("budget_min")) : null,
      budget_max: fd.get("budget_max") ? Number(fd.get("budget_max")) : null,
      looking_for: (fd.get("looking_for") as ListingType) || null,
      stage: (fd.get("stage") as ClientStage) || "yeni",
      offer_property_id: (fd.get("offer_property_id") as string) || null,
      offer_amount: fd.get("offer_amount") ? Number(fd.get("offer_amount")) : null,
      notes: (fd.get("notes") as string) || null,
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    (e.target as HTMLFormElement).reset();
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
      >
        + Müşteri Ekle
      </button>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2"
    >
      <Input name="full_name" label="Ad Soyad" required className="sm:col-span-2" />
      <Input name="phone" label="Telefon" />
      <Input name="email" label="E-posta" type="email" />
      <Input name="budget_min" label="Bütçe Min" type="number" step="0.01" />
      <Input name="budget_max" label="Bütçe Max" type="number" step="0.01" />
      <Select
        name="looking_for"
        label="Aradığı"
        options={lookingFor}
        placeholder="Seçiniz"
      />
      <Select name="stage" label="Aşama" options={CLIENT_STAGES} />

      {/* Teklif verilen ilan */}
      <Select
        name="offer_property_id"
        label="Teklif Verdiği İlan"
        options={properties}
        placeholder="İlan seçin (opsiyonel)"
      />
      <Input name="offer_amount" label="Teklif Tutarı (₺)" type="number" step="0.01" />

      <Textarea name="notes" label="Notlar" className="sm:col-span-2" />

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
          {loading ? "Kaydediliyor..." : "Kaydet"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          İptal
        </button>
      </div>
    </form>
  );
}
