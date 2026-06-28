"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input, Select, Textarea } from "@/components/FormFields";
import CityDistrictSelect from "@/components/CityDistrictSelect";
import type {
  Currency,
  ListingType,
  Property,
  PropertyKind,
  PropertyStatus,
} from "@/types";

const listingTypes: ListingType[] = ["satılık", "kiralık"];
const kinds: PropertyKind[] = ["daire", "villa", "arsa"];
const currencies: Currency[] = ["TRY", "USD", "EUR"];
const statuses: PropertyStatus[] = ["aktif", "pasif", "satıldı"];
const roomOptions = [
  "1+0",
  "1+1",
  "2+1",
  "3+1",
  "3+2",
  "4+1",
  "4+2",
  "5+1",
  "6+1",
  "Stüdyo",
  "Müstakil",
];

const BUCKET = "property-images";
const MAX_MB = 5;

type NewItem = { file: File; preview: string };

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
  const [rooms, setRooms] = useState(initial?.rooms ?? "");

  // Mevcut galeri: images[] yoksa eski image_url'e düş
  const initialImages =
    initial?.images && initial.images.length > 0
      ? initial.images
      : initial?.image_url
        ? [initial.image_url]
        : [];

  const [kept, setKept] = useState<string[]>(initialImages);
  const [items, setItems] = useState<NewItem[]>([]);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const files = Array.from(e.target.files ?? []);
    const valid: NewItem[] = [];
    for (const f of files) {
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

  function removeKept(url: string) {
    setKept((prev) => prev.filter((u) => u !== url));
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
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const fd = new FormData(form);
    const supabase = createClient();

    // Yeni dosyaları yükle
    const uploaded: string[] = [];
    for (const it of items) {
      const ext = it.file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const up = await supabase.storage
        .from(BUCKET)
        .upload(path, it.file, { cacheControl: "3600", upsert: false });
      if (up.error) {
        setLoading(false);
        setError(`Görsel yüklenemedi: ${up.error.message}`);
        return;
      }
      uploaded.push(
        supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
      );
    }

    const images = [...kept, ...uploaded];
    const cover = images[0] ?? null;

    const payload = {
      title: String(fd.get("title")),
      type: fd.get("type") as ListingType,
      property_type: fd.get("property_type") as PropertyKind,
      price: Number(fd.get("price")),
      currency: fd.get("currency") as Currency,
      rooms: rooms || null,
      area_m2: fd.get("area_m2") ? Number(fd.get("area_m2")) : null,
      location: (fd.get("location") as string) || null,
      district: (fd.get("district") as string) || null,
      city: (fd.get("city") as string) || null,
      listing_url: (fd.get("listing_url") as string) || null,
      owner_name: (fd.get("owner_name") as string) || null,
      owner_phone: (fd.get("owner_phone") as string) || null,
      description: (fd.get("description") as string) || null,
      images,
      image_url: cover,
      status: fd.get("status") as PropertyStatus,
    };

    const { error } =
      mode === "edit" && initial
        ? await supabase.from("properties").update(payload).eq("id", initial.id)
        : await supabase.from("properties").insert(payload);

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }

    if (mode === "edit") {
      router.push("/properties");
      router.refresh();
    } else {
      form.reset();
      setRooms("");
      items.forEach((it) => URL.revokeObjectURL(it.preview));
      setItems([]);
      setKept([]);
      router.refresh();
      onDone?.();
    }
  }

  const totalImages = kept.length + items.length;

  return (
    <form
      onSubmit={onSubmit}
      className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2"
    >
      {/* Galeri */}
      <div className="flex flex-col gap-2 text-sm sm:col-span-2">
        <span className="text-slate-600 dark:text-slate-300">
          Fotoğraflar{" "}
          <span className="text-slate-400">
            ({totalImages}) — ilki kapak olur
          </span>
        </span>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={onPick}
          className="hidden"
        />
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {kept.map((url, i) => (
            <Thumb
              key={url}
              src={url}
              cover={i === 0}
              onRemove={() => removeKept(url)}
            />
          ))}
          {items.map((it, i) => (
            <Thumb
              key={it.preview}
              src={it.preview}
              cover={kept.length === 0 && i === 0}
              onRemove={() => removeItem(i)}
            />
          ))}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 transition hover:border-brand hover:text-brand dark:border-slate-700 dark:hover:border-brand-light"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span className="text-[11px]">Ekle</span>
          </button>
        </div>
      </div>

      <Input
        name="title"
        label="Başlık"
        required
        defaultValue={initial?.title}
        className="sm:col-span-2"
      />
      <Select
        name="type"
        label="İlan Tipi"
        options={listingTypes}
        defaultValue={initial?.type}
      />
      <Select
        name="property_type"
        label="Gayrimenkul Türü"
        options={kinds}
        defaultValue={initial?.property_type}
      />
      <Input
        name="price"
        label="Fiyat"
        type="number"
        step="0.01"
        required
        defaultValue={initial?.price}
      />
      <Select
        name="currency"
        label="Para Birimi"
        options={currencies}
        defaultValue={initial?.currency}
      />
      <Select
        name="rooms"
        label="Oda Sayısı"
        options={roomOptions}
        placeholder="Seçiniz"
        value={rooms}
        onChange={(e) => setRooms(e.target.value)}
      />
      <Input
        name="area_m2"
        label="Alan (m²)"
        type="number"
        step="0.01"
        defaultValue={initial?.area_m2 ?? undefined}
      />

      <CityDistrictSelect
        initialCity={initial?.city ?? ""}
        initialDistrict={initial?.district ?? ""}
      />

      <Input
        name="location"
        label="Konum / Mahalle"
        defaultValue={initial?.location ?? undefined}
        className="sm:col-span-2"
      />
      <Input
        name="listing_url"
        label="İlan Linki"
        type="url"
        placeholder="https://..."
        defaultValue={initial?.listing_url ?? undefined}
        className="sm:col-span-2"
      />

      <div className="mt-1 sm:col-span-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-brass dark:text-brass-light">
          Tapu Sahibi Bilgileri
        </p>
      </div>
      <Input
        name="owner_name"
        label="Tapu Sahibi Adı"
        defaultValue={initial?.owner_name ?? undefined}
      />
      <Input
        name="owner_phone"
        label="Tapu Sahibi Telefon"
        defaultValue={initial?.owner_phone ?? undefined}
      />

      <Select
        name="status"
        label="Durum"
        options={statuses}
        defaultValue={initial?.status}
      />
      <div className="hidden sm:block" />

      <Textarea
        name="description"
        label="Açıklama"
        defaultValue={initial?.description ?? undefined}
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

function Thumb({
  src,
  cover,
  onRemove,
}: {
  src: string;
  cover: boolean;
  onRemove: () => void;
}) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="h-full w-full object-cover" />
      {cover ? (
        <span className="absolute left-1 top-1 rounded bg-brand px-1.5 py-0.5 text-[10px] font-medium text-white">
          Kapak
        </span>
      ) : null}
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white hover:bg-rose-600"
        aria-label="Kaldır"
      >
        ×
      </button>
    </div>
  );
}
