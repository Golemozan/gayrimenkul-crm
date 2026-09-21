// Eşleştirme motoru — saf fonksiyonlar, DB bilmez.
// Test: node --test lib/matching.test.ts
//
// İki katman:
//  1) Sert filtreler: biri tutmazsa eşleşme yok (tip, tür, il/ilçe, para birimi,
//     bütçe + %10 tolerans, ikisi de aktif).
//  2) Puan (0-100): bütçe 30 · oda 20 · m² 20 · özellikler 30. Talepte boş
//     bırakılan kriter tam puan alır. MIN_SCORE altı bildirim üretmez — oda da,
//     m² de, özellikler de tutmuyorsa emlakçıyı rahatsız etmeye değmez.

import type { Demand, Property } from "@/types";

export const BUDGET_TOLERANCE = 0.1;
export const MIN_SCORE = 50;

export type MatchInput = {
  property: Pick<
    Property,
    | "status"
    | "type"
    | "property_type"
    | "price"
    | "currency"
    | "rooms"
    | "area_m2"
    | "city"
    | "district"
    | "features"
  >;
  demand: Pick<
    Demand,
    | "status"
    | "type"
    | "property_types"
    | "city"
    | "districts"
    | "budget_min"
    | "budget_max"
    | "currency"
    | "rooms_min"
    | "area_min"
    | "area_max"
    | "features"
  >;
};

export type MatchResult =
  | { match: false; rejected: string }
  | { match: true; score: number; reasons: string[]; misses: string[] };

/** "3+1" → 3, "Stüdyo"/"1+0" → 1, tanınmazsa null. */
export function parseRooms(rooms: string | null | undefined): number | null {
  if (!rooms) return null;
  const s = rooms.trim().toLocaleLowerCase("tr");
  if (s === "stüdyo" || s === "1+0") return 1;
  const m = /^(\d+)\s*\+\s*\d+$/.exec(s);
  return m ? Number(m[1]) : null;
}

function same(a: string | null | undefined, b: string | null | undefined) {
  if (!a || !b) return false;
  return a.trim().toLocaleLowerCase("tr") === b.trim().toLocaleLowerCase("tr");
}

const pct = (n: number) => `%${Math.round(n * 100)}`;

export function evaluate({ property: p, demand: d }: MatchInput): MatchResult {
  // --- Sert filtreler -------------------------------------------------------
  if (p.status !== "aktif") return { match: false, rejected: "ilan aktif değil" };
  if (d.status !== "aktif") return { match: false, rejected: "talep aktif değil" };
  if (p.type !== d.type) return { match: false, rejected: "ilan tipi farklı" };

  if (d.property_types.length > 0 && !d.property_types.includes(p.property_type))
    return { match: false, rejected: "gayrimenkul türü farklı" };

  if (d.city && !same(p.city, d.city))
    return { match: false, rejected: "il farklı" };

  if (d.districts.length > 0 && !d.districts.some((x) => same(x, p.district)))
    return { match: false, rejected: "ilçe farklı" };

  const hasBudget = d.budget_min != null || d.budget_max != null;
  if (hasBudget && p.currency !== d.currency)
    return { match: false, rejected: "para birimi farklı" };

  if (d.budget_min != null && p.price < d.budget_min)
    return { match: false, rejected: "bütçenin altında" };

  if (d.budget_max != null && p.price > d.budget_max * (1 + BUDGET_TOLERANCE))
    return { match: false, rejected: "bütçenin üstünde" };

  // --- Puan -----------------------------------------------------------------
  const reasons: string[] = [];
  const misses: string[] = [];
  let score = 0;

  if (d.city) reasons.push([p.district, p.city].filter(Boolean).join(", "));

  // Bütçe (30)
  if (d.budget_max == null) {
    score += 30;
  } else if (p.price <= d.budget_max) {
    score += 30;
    reasons.push("bütçe içinde");
  } else {
    const over = (p.price - d.budget_max) / d.budget_max;
    score += 30 * (1 - over / BUDGET_TOLERANCE);
    misses.push(`bütçenin ${pct(over)} üstünde`);
  }

  // Oda (20)
  if (d.rooms_min == null) {
    score += 20;
  } else {
    const r = parseRooms(p.rooms);
    if (r == null) {
      score += 10;
      misses.push("oda sayısı belirsiz");
    } else if (r >= d.rooms_min) {
      score += 20;
      reasons.push(p.rooms!);
    } else {
      misses.push(`${p.rooms} (en az ${d.rooms_min} oda isteniyor)`);
    }
  }

  // m² (20)
  if (d.area_min == null && d.area_max == null) {
    score += 20;
  } else if (p.area_m2 == null) {
    score += 10;
    misses.push("m² belirsiz");
  } else {
    const lo = d.area_min ?? 0;
    const hi = d.area_max ?? Infinity;
    if (p.area_m2 >= lo && p.area_m2 <= hi) {
      score += 20;
      reasons.push(`${p.area_m2} m²`);
    } else if (p.area_m2 >= lo * 0.9 && p.area_m2 <= hi * 1.1) {
      score += 10;
      misses.push(`${p.area_m2} m² (aralığa yakın)`);
    } else {
      misses.push(`${p.area_m2} m² (aralık dışı)`);
    }
  }

  // Özellikler (30)
  if (d.features.length === 0) {
    score += 30;
  } else {
    const have = d.features.filter((f) => p.features.includes(f));
    score += 30 * (have.length / d.features.length);
    have.forEach((f) => reasons.push(f));
    d.features
      .filter((f) => !p.features.includes(f))
      .forEach((f) => misses.push(`${f} yok`));
  }

  score = Math.round(score);
  if (score < MIN_SCORE)
    return { match: false, rejected: `puan düşük (${score})` };

  return { match: true, score, reasons, misses };
}
