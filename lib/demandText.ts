import { formatMoney } from "@/lib/constants";
import type { Demand } from "@/types";

/** "Kadıköy, Üsküdar / İstanbul · daire · 3+ oda · ≤ ₺10.000.000 · 100–150 m²" */
export function demandSummary(d: Demand) {
  const loc = d.city
    ? d.districts.length
      ? `${d.districts.join(", ")} / ${d.city}`
      : `${d.city} (tümü)`
    : "Konum farketmez";
  const budget =
    d.budget_min != null && d.budget_max != null
      ? `${formatMoney(d.budget_min, d.currency)} – ${formatMoney(d.budget_max, d.currency)}`
      : d.budget_max != null
        ? `≤ ${formatMoney(d.budget_max, d.currency)}`
        : d.budget_min != null
          ? `≥ ${formatMoney(d.budget_min, d.currency)}`
          : null;
  const area =
    d.area_min != null || d.area_max != null
      ? `${d.area_min ?? "…"}–${d.area_max ?? "…"} m²`
      : null;
  return [
    loc,
    d.property_types.length ? d.property_types.join("/") : null,
    d.rooms_min != null ? `${d.rooms_min}+ oda` : null,
    budget,
    area,
  ]
    .filter(Boolean)
    .join(" · ");
}
