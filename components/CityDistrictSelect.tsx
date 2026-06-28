"use client";

import { useEffect, useMemo, useState } from "react";

type Province = { name: string; districts: { name: string }[] };

const fieldCls =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-brand-light";
const labelCls = "text-slate-600 dark:text-slate-300";

export default function CityDistrictSelect({
  initialCity = "",
  initialDistrict = "",
}: {
  initialCity?: string;
  initialDistrict?: string;
}) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [city, setCity] = useState(initialCity);
  const [district, setDistrict] = useState(initialDistrict);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(
          "https://turkiyeapi.dev/api/v1/provinces?fields=name,districts",
          { cache: "force-cache" }
        );
        if (!res.ok) throw new Error(String(res.status));
        const json = await res.json();
        const list: Province[] = (json.data ?? []).map((p: Province) => ({
          name: p.name,
          districts: (p.districts ?? []).map((d) => ({ name: d.name })),
        }));
        list.sort((a, b) => a.name.localeCompare(b.name, "tr"));
        if (alive) {
          setProvinces(list);
          setStatus("ok");
        }
      } catch {
        if (alive) setStatus("error");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const districts = useMemo(() => {
    const p = provinces.find((x) => x.name === city);
    return (p?.districts ?? [])
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name, "tr"));
  }, [provinces, city]);

  // API erişilemezse düz metin girişine düş.
  if (status === "error") {
    return (
      <>
        <label className="flex flex-col gap-1 text-sm">
          <span className={labelCls}>Şehir</span>
          <input
            name="city"
            defaultValue={initialCity}
            className={fieldCls}
            placeholder="örn. İstanbul"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className={labelCls}>İlçe</span>
          <input
            name="district"
            defaultValue={initialDistrict}
            className={fieldCls}
            placeholder="örn. Kadıköy"
          />
        </label>
      </>
    );
  }

  const loading = status === "loading";

  return (
    <>
      <label className="flex flex-col gap-1 text-sm">
        <span className={labelCls}>Şehir</span>
        <select
          name="city"
          value={city}
          disabled={loading}
          onChange={(e) => {
            setCity(e.target.value);
            setDistrict("");
          }}
          className={fieldCls}
        >
          <option value="">{loading ? "Yükleniyor…" : "Seçiniz"}</option>
          {provinces.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className={labelCls}>İlçe</span>
        <select
          name="district"
          value={district}
          disabled={loading || !city}
          onChange={(e) => setDistrict(e.target.value)}
          className={fieldCls}
        >
          <option value="">
            {!city ? "Önce şehir seçin" : "Seçiniz"}
          </option>
          {districts.map((d) => (
            <option key={d.name} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}
