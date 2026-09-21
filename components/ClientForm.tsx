"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Input, Select, Textarea } from "@/components/FormFields";
import DemandFields, { draftFrom, draftToPayload } from "@/components/DemandFields";
import { Button, Notice, SectionLabel } from "@/components/primitives";
import { createClientWithDemand, editClient } from "@/app/actions/clients";
import { notifyMatches } from "@/lib/notify";
import { CLIENT_STAGES, type Client } from "@/types";

type Option = { value: string; label: string };

const str = (v: FormDataEntryValue | null) => String(v ?? "").trim() || null;
const num = (v: FormDataEntryValue | null) => (str(v) == null ? null : Number(v));

function clientPayload(fd: FormData) {
  return {
    full_name: String(fd.get("full_name") ?? ""),
    phone: str(fd.get("phone")),
    email: str(fd.get("email")),
    stage: fd.get("stage") || "yeni",
    offer_property_id: str(fd.get("offer_property_id")),
    offer_amount: num(fd.get("offer_amount")),
    notes: str(fd.get("notes")),
  };
}

function ClientFields({ initial, properties }: { initial?: Client; properties: Option[] }) {
  return (
    <>
      <Input name="full_name" label="Ad Soyad" required defaultValue={initial?.full_name} className="sm:col-span-2" />
      <Input name="phone" label="Telefon" type="tel" placeholder="05xx xxx xx xx" defaultValue={initial?.phone ?? undefined} />
      <Input name="email" label="E-posta" type="email" defaultValue={initial?.email ?? undefined} />
      <Select name="stage" label="Aşama" options={CLIENT_STAGES} defaultValue={initial?.stage} />
      <div className="hidden sm:block" />
      <Select name="offer_property_id" label="Teklif Verdiği İlan" options={properties} placeholder="Yok" defaultValue={initial?.offer_property_id ?? ""} />
      <Input name="offer_amount" label="Teklif Tutarı" type="number" min="0" step="0.01" defaultValue={initial?.offer_amount ?? undefined} />
      <Textarea name="notes" label="Notlar" defaultValue={initial?.notes ?? undefined} className="sm:col-span-2" />
    </>
  );
}

/** Müşteri listesi: yeni müşteri + (isteğe bağlı) ilk talebi tek formda. */
export default function ClientForm({ properties = [] }: { properties?: Option[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [withDemand, setWithDemand] = useState(true);
  const [draft, setDraft] = useState(() => draftFrom());
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    start(async () => {
      const res = await createClientWithDemand(
        clientPayload(fd),
        withDemand ? draftToPayload(draft, "") : null
      );
      if (!res.ok) {
        setError(res.error);
        return;
      }
      toast.success("Müşteri eklendi");
      notifyMatches(res.data.newMatches, "talep");
      setOpen(false);
      setDraft(draftFrom());
      router.push(`/clients/${res.data.id}`);
    });
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Müşteri Ekle
      </Button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ClientFields properties={properties} />
      </div>

      <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
        <label className="mb-3 flex min-h-9 cursor-pointer items-center gap-2">
          <input type="checkbox" checked={withDemand} onChange={(e) => setWithDemand(e.target.checked)} className="h-4 w-4 accent-brand" />
          <SectionLabel>Ne arıyor? — talebi şimdi gir</SectionLabel>
        </label>
        {withDemand ? <DemandFields value={draft} onChange={setDraft} showStatus={false} /> : null}
      </div>

      {error ? <Notice>{error}</Notice> : null}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Kaydediliyor…" : "Kaydet"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
          İptal
        </Button>
      </div>
    </form>
  );
}

/** Müşteri detayı: kişi bilgilerini düzenle. */
export function EditClientForm({
  client,
  properties,
  onClose,
}: {
  client: Client;
  properties: Option[];
  onClose: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await editClient(client.id, clientPayload(fd));
      if (!res.ok) {
        setError(res.error);
        return;
      }
      toast.success("Müşteri güncellendi");
      onClose();
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2">
      <ClientFields initial={client} properties={properties} />
      {error ? <Notice className="sm:col-span-2">{error}</Notice> : null}
      <div className="flex gap-3 sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Kaydediliyor…" : "Güncelle"}
        </Button>
        <Button type="button" variant="secondary" onClick={onClose}>
          İptal
        </Button>
      </div>
    </form>
  );
}
