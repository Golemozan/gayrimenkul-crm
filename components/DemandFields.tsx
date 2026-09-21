"use client";

// Talep alanları — hem "müşteri ekle" formunda hem talep ekle/düzenle formunda.
// Kontrollü: değer üstte tutulur, kaydetme üst bileşenin işi.
import ChipMultiSelect from "@/components/ChipMultiSelect";
import { CityMultiDistrict } from "@/components/CityDistrictSelect";
import { Input, Select, Textarea } from "@/components/FormFields";
import {
  CURRENCIES,
  DEMAND_STATUSES,
  FEATURES,
  LISTING_TYPES,
  PROPERTY_KINDS,
} from "@/lib/constants";
import type { Currency, Demand, DemandStatus, ListingType, PropertyKind } from "@/types";

type Feature = (typeof FEATURES)[number];

export type DemandDraft = {
  type: ListingType;
  property_types: PropertyKind[];
  city: string;
  districts: string[];
  budget_min: string;
  budget_max: string;
  currency: Currency;
  rooms_min: string;
  area_min: string;
  area_max: string;
  features: Feature[];
  status: DemandStatus;
  notes: string;
};

const s = (n: number | null | undefined) => (n == null ? "" : String(n));

export function draftFrom(d?: Demand): DemandDraft {
  return {
    type: d?.type ?? "satılık",
    property_types: d?.property_types ?? [],
    city: d?.city ?? "",
    districts: d?.districts ?? [],
    budget_min: s(d?.budget_min),
    budget_max: s(d?.budget_max),
    currency: d?.currency ?? "TRY",
    rooms_min: s(d?.rooms_min),
    area_min: s(d?.area_min),
    area_max: s(d?.area_max),
    features: (d?.features ?? []) as Feature[],
    status: d?.status ?? "aktif",
    notes: d?.notes ?? "",
  };
}

const num = (v: string) => (v.trim() === "" ? null : Number(v));

/** Server action'a gidecek şekil. */
export function draftToPayload(d: DemandDraft, clientId: string) {
  return {
    client_id: clientId,
    type: d.type,
    property_types: d.property_types,
    city: d.city || null,
    districts: d.districts,
    budget_min: num(d.budget_min),
    budget_max: num(d.budget_max),
    currency: d.currency,
    rooms_min: num(d.rooms_min),
    area_min: num(d.area_min),
    area_max: num(d.area_max),
    features: d.features,
    status: d.status,
    notes: d.notes || null,
  };
}

export default function DemandFields({
  value: d,
  onChange,
  showStatus = true,
}: {
  value: DemandDraft;
  onChange: (d: DemandDraft) => void;
  showStatus?: boolean;
}) {
  const set = <K extends keyof DemandDraft>(k: K, v: DemandDraft[K]) => onChange({ ...d, [k]: v });

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Select label="Aradığı" options={LISTING_TYPES} value={d.type} onChange={(e) => set("type", e.target.value as ListingType)} />
      {showStatus ? (
        <Select label="Talep durumu" options={DEMAND_STATUSES} value={d.status} onChange={(e) => set("status", e.target.value as DemandStatus)} />
      ) : (
        <div className="hidden sm:block" />
      )}

      <ChipMultiSelect
        label="Gayrimenkul türü"
        hint="boş = hepsi"
        options={PROPERTY_KINDS}
        value={d.property_types}
        onChange={(v) => set("property_types", v)}
        className="sm:col-span-2"
      />

      <CityMultiDistrict city={d.city} districts={d.districts} onChange={(city, districts) => onChange({ ...d, city, districts })} />

      <Input label="Bütçe min" type="number" min="0" step="1000" inputMode="numeric" value={d.budget_min} onChange={(e) => set("budget_min", e.target.value)} />
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <Input label="Bütçe max" type="number" min="0" step="1000" inputMode="numeric" value={d.budget_max} onChange={(e) => set("budget_max", e.target.value)} />
        <Select label="Birim" options={CURRENCIES} value={d.currency} onChange={(e) => set("currency", e.target.value as Currency)} />
      </div>

      <Select
        label="En az oda"
        options={["1", "2", "3", "4", "5", "6"].map((n) => ({ value: n, label: `${n}+` }))}
        placeholder="Farketmez"
        value={d.rooms_min}
        onChange={(e) => set("rooms_min", e.target.value)}
      />
      <div className="grid grid-cols-2 gap-2">
        <Input label="m² min" type="number" min="0" inputMode="numeric" value={d.area_min} onChange={(e) => set("area_min", e.target.value)} />
        <Input label="m² max" type="number" min="0" inputMode="numeric" value={d.area_max} onChange={(e) => set("area_max", e.target.value)} />
      </div>

      <ChipMultiSelect
        label="İstediği özellikler"
        hint="eksikse puan düşer, eşleşme kaybolmaz"
        options={FEATURES}
        value={d.features}
        onChange={(v) => set("features", v)}
        className="sm:col-span-2"
      />

      <Textarea label="Talep notu" value={d.notes} onChange={(e) => set("notes", e.target.value)} className="sm:col-span-2" />
    </div>
  );
}
