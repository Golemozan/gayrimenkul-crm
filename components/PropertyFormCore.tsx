"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { Input, Select, Textarea } from "@/components/FormFields";
import CityDistrictSelect from "@/components/CityDistrictSelect";
import ChipMultiSelect from "@/components/ChipMultiSelect";
import { Button, Notice, SectionLabel } from "@/components/primitives";
import { saveProperty } from "@/app/actions/properties";
import { notifyMatches } from "@/lib/notify";
import {
  CURRENCIES,
  FEATURES,
  LISTING_TYPES,
  PROPERTY_KINDS,
  PROPERTY_STATUSES,
  ROOM_OPTIONS,
} from "@/lib/constants";
import type { Property } from "@/types";
import { DEMO } from "@/lib/demo";

const MAX_MB = 5;
type NewItem = { file: File; preview: string };
type Feature = (typeof FEATURES)[number];

const numOrNull = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").trim();
  return s === "" ? null : Number(s);
};
const strOrNull = (v: FormDataEntryValue | null) => String(v ?? "").trim() || null;

async function upload(file: File) {
  const fd = new FormData();
  fd.set("file", file);
  const res = await fetch("/api/uploads", { method: "POST", body: fd });
  const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !json.url) throw new Error(json.error ?? `Yükleme hatası (${res.status})`);
  return json.url;
}

export default function PropertyFormCore({
  mode,
  initial,
  onDone,
  onCancel,
}: {
  mode: "create" | "edit";
  initial?: Property;
  onDone?: () => void;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [features, setFeatures] = useState<Feature[]>((initial?.features ?? []) as Feature[]);
  const [kept, setKept] = useState<string[]>(
    initial?.images?.length ? initial.images : initial?.image_url ? [initial.image_url] : []
  );
  const [items, setItems] = useState<NewItem[]>([]);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const valid: NewItem[] = [];
    for (const f of Array.from(e.target.files ?? [])) {
      if (!f.type.startsWith("image/")) {
        setError("Sadece görsel dosyası yükleyin.");
        continue;
      }
      if (f.size > MAX_MB * 1024 * 1024) {
        setError(`Her görsel ${MAX_MB} MB'tan küçük olmalı.`);
        continue;
      }
      valid.push({ file: f, preview: URL.createObjectURL(f) });
    }
    setItems((prev) => [...prev, ...valid]);
    if (fileRef.current) fileRef.current.value = "";
  }

  function removeItem(idx: number) {
    setItems((prev) => {
      const it = prev[idx];
      if (it) URL.revokeObjectURL(it.preview);
      return prev.filter((_, i) => i !== idx);
    });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setLoading(true);
    setError(null);

    try {
      const uploaded: string[] = [];
      for (const it of items) uploaded.push(await upload(it.file));

      const res = await saveProperty(initial?.id ?? null, {
        title: String(fd.get("title") ?? ""),
        type: fd.get("type"),
        property_type: fd.get("property_type"),
        price: numOrNull(fd.get("price")),
        currency: fd.get("currency"),
        rooms: strOrNull(fd.get("rooms")),
        area_m2: numOrNull(fd.get("area_m2")),
        location: strOrNull(fd.get("location")),
        district: strOrNull(fd.get("district")),
        city: strOrNull(fd.get("city")),
        listing_url: strOrNull(fd.get("listing_url")),
        owner_name: strOrNull(fd.get("owner_name")),
        owner_phone: strOrNull(fd.get("owner_phone")),
        description: strOrNull(fd.get("description")),
        images: [...kept, ...uploaded],
        features,
        status: fd.get("status"),
      });

      if (!res.ok) {
        setError(res.error);
        return;
      }
      toast.success(mode === "edit" ? "İlan güncellendi" : "İlan eklendi");
      notifyMatches(res.data.newMatches, "ilan");

      if (mode === "edit") {
        router.push(`/properties/${res.data.id}`);
      } else {
        form.reset();
        items.forEach((it) => URL.revokeObjectURL(it.preview));
        setItems([]);
        setKept([]);
        setFeatures([]);
        onDone?.();
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const totalImages = kept.length + items.length;

  return (
    <form
      onSubmit={onSubmit}
      className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2"
    >
      {/* Galeri */}
      <div className="flex flex-col gap-2 text-sm sm:col-span-2">
        <span className="text-slate-600 dark:text-slate-300">
          Fotoğraflar <span className="text-slate-400">({totalImages}) — ilki kapak olur</span>
        </span>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={onPick} className="hidden" />
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {kept.map((url, i) => (
            <Thumb key={url} src={url} cover={i === 0} onRemove={() => setKept((p) => p.filter((u) => u !== url))} />
          ))}
          {items.map((it, i) => (
            <Thumb key={it.preview} src={it.preview} cover={kept.length === 0 && i === 0} onRemove={() => removeItem(i)} />
          ))}
          {DEMO ? (
            <div className="col-span-2 flex items-center rounded-lg border border-dashed border-slate-300 p-3 text-xs text-slate-400 dark:border-slate-700 sm:col-span-3">
              Demoda fotoğraf yükleme kapalı.
            </div>
          ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 transition hover:border-brand hover:text-brand dark:border-slate-700 dark:hover:border-brand-light"
          >
            <Plus className="h-6 w-6" />
            <span className="text-[11px]">Ekle</span>
          </button>
          )}
        </div>
      </div>

      <Input name="title" label="Başlık" required defaultValue={initial?.title} className="sm:col-span-2" />
      <Select name="type" label="İlan Tipi" options={LISTING_TYPES} defaultValue={initial?.type} />
      <Select name="property_type" label="Gayrimenkul Türü" options={PROPERTY_KINDS} defaultValue={initial?.property_type} />
      <Input name="price" label="Fiyat" type="number" step="0.01" min="0" required defaultValue={initial?.price} />
      <Select name="currency" label="Para Birimi" options={CURRENCIES} defaultValue={initial?.currency} />
      <Select name="rooms" label="Oda Sayısı" options={ROOM_OPTIONS} placeholder="Seçiniz" defaultValue={initial?.rooms ?? ""} />
      <Input name="area_m2" label="Alan (m²)" type="number" step="0.01" min="0" defaultValue={initial?.area_m2 ?? undefined} />

      <CityDistrictSelect initialCity={initial?.city ?? ""} initialDistrict={initial?.district ?? ""} />

      <Input name="location" label="Mahalle / Adres" defaultValue={initial?.location ?? undefined} className="sm:col-span-2" />

      <ChipMultiSelect
        label="Özellikler"
        hint="talepteki isteklerle eşleştirilir"
        options={FEATURES}
        value={features}
        onChange={setFeatures}
        className="sm:col-span-2"
      />

      <Input name="listing_url" label="İlan Linki" type="url" placeholder="https://..." defaultValue={initial?.listing_url ?? undefined} className="sm:col-span-2" />

      <div className="mt-1 sm:col-span-2">
        <SectionLabel>Tapu Sahibi Bilgileri</SectionLabel>
      </div>
      <Input name="owner_name" label="Tapu Sahibi Adı" defaultValue={initial?.owner_name ?? undefined} />
      <Input name="owner_phone" label="Tapu Sahibi Telefon" type="tel" defaultValue={initial?.owner_phone ?? undefined} />

      <Select name="status" label="Durum" options={PROPERTY_STATUSES} defaultValue={initial?.status} />
      <div className="hidden sm:block" />

      <Textarea name="description" label="Açıklama" defaultValue={initial?.description ?? undefined} className="sm:col-span-2" />

      {error ? <Notice className="sm:col-span-2">{error}</Notice> : null}

      <div className="flex gap-3 sm:col-span-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Kaydediliyor…" : mode === "edit" ? "Güncelle" : "Kaydet"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          İptal
        </Button>
      </div>
    </form>
  );
}

function Thumb({ src, cover, onRemove }: { src: string; cover: boolean; onRemove: () => void }) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="h-full w-full object-cover" />
      {cover ? (
        <span className="absolute left-1 top-1 rounded bg-brand px-1.5 py-0.5 text-[10px] font-medium text-white">Kapak</span>
      ) : null}
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-rose-600"
        aria-label="Görseli kaldır"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
