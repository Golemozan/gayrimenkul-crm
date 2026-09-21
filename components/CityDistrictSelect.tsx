"use client";

// İl/ilçe listesi projeye gömülü (lib/tr-il-ilce.json, 81 il / 973 ilçe).
// Dış servise bağımlılık yok: internet gitse de form çalışır.
import { useMemo, useState } from "react";
import data from "@/lib/tr-il-ilce.json";
import { ToggleChip } from "@/components/primitives";

type Province = { n: string; d: string[] };
const provinces = data as Province[];

const fieldCls =
  "min-h-9 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-brand-light";
const labelCls = "text-slate-600 dark:text-slate-300";

const districtsOf = (city: string) => provinces.find((p) => p.n === city)?.d ?? [];

function CitySelect({
  value,
  onChange,
  name,
  placeholder = "Seçiniz",
}: {
  value: string;
  onChange: (v: string) => void;
  name?: string;
  placeholder?: string;
}) {
  // Eski kayıtta listede olmayan bir il yazılıysa kaybolmasın.
  const known = !value || provinces.some((p) => p.n === value);
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className={labelCls}>İl</span>
      <select name={name} value={value} onChange={(e) => onChange(e.target.value)} className={fieldCls}>
        <option value="">{placeholder}</option>
        {!known ? <option value={value}>{value}</option> : null}
        {provinces.map((p) => (
          <option key={p.n} value={p.n}>
            {p.n}
          </option>
        ))}
      </select>
    </label>
  );
}

/** İlan formu: tek il + tek ilçe, form alanı olarak (name=city/district). */
export default function CityDistrictSelect({
  initialCity = "",
  initialDistrict = "",
}: {
  initialCity?: string;
  initialDistrict?: string;
}) {
  const [city, setCity] = useState(initialCity);
  const [district, setDistrict] = useState(initialDistrict);
  const districts = useMemo(() => districtsOf(city), [city]);
  const knownDistrict = !district || districts.includes(district);

  return (
    <>
      <CitySelect
        name="city"
        value={city}
        onChange={(v) => {
          setCity(v);
          setDistrict("");
        }}
      />
      <label className="flex flex-col gap-1 text-sm">
        <span className={labelCls}>İlçe</span>
        <select
          name="district"
          value={district}
          disabled={!city}
          onChange={(e) => setDistrict(e.target.value)}
          className={fieldCls}
        >
          <option value="">{!city ? "Önce il seçin" : "Seçiniz"}</option>
          {!knownDistrict ? <option value={district}>{district}</option> : null}
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}

/** Talep formu: tek il + çoklu ilçe (boş = ilin tamamı). Kontrollü bileşen. */
export function CityMultiDistrict({
  city,
  districts,
  onChange,
}: {
  city: string;
  districts: string[];
  onChange: (city: string, districts: string[]) => void;
}) {
  const all = useMemo(() => districtsOf(city), [city]);
  const toggle = (d: string) =>
    onChange(city, districts.includes(d) ? districts.filter((x) => x !== d) : [...districts, d]);

  return (
    <div className="flex flex-col gap-3 sm:col-span-2">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <CitySelect value={city} onChange={(v) => onChange(v, [])} placeholder="Farketmez" />
      </div>
      {city ? (
        <div className="text-sm">
          <div className="mb-1.5 flex items-center justify-between">
            <span className={labelCls}>
              İlçeler{" "}
              <span className="text-slate-400">
                ({districts.length ? `${districts.length} seçili` : "hiçbiri seçilmezse ilin tamamı"})
              </span>
            </span>
            {districts.length ? (
              <button type="button" onClick={() => onChange(city, [])} className="min-h-9 px-2 text-xs font-medium text-brand hover:underline dark:text-brand-light">
                Temizle
              </button>
            ) : null}
          </div>
          <div className="flex max-h-44 flex-wrap gap-1.5 overflow-y-auto rounded-lg border border-slate-200 p-2 dark:border-slate-800">
            {all.map((d) => (
              <ToggleChip key={d} selected={districts.includes(d)} onClick={() => toggle(d)}>
                {d}
              </ToggleChip>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
