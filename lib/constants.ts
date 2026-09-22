import type {
  ActivityKind,
  AppointmentStatus,
  Currency,
  DemandStatus,
  ListingType,
  MatchStatus,
  PropertyKind,
  PropertyStatus,
} from "@/types";

export const LISTING_TYPES: ListingType[] = ["satılık", "kiralık"];
export const PROPERTY_KINDS: PropertyKind[] = ["daire", "villa", "arsa"];
export const CURRENCIES: Currency[] = ["TRY", "USD", "EUR"];
export const PROPERTY_STATUSES: PropertyStatus[] = ["aktif", "pasif", "satıldı"];
export const APPOINTMENT_STATUSES: AppointmentStatus[] = [
  "bekliyor",
  "tamamlandı",
  "iptal",
];
export const DEMAND_STATUSES: DemandStatus[] = ["aktif", "pasif", "karşılandı"];
export const MATCH_STATUSES: MatchStatus[] = [
  "yeni",
  "iletildi",
  "ilgileniyor",
  "ilgilenmedi",
];
export const ACTIVITY_KINDS: ActivityKind[] = [
  "arama",
  "görüşme",
  "yer gösterme",
  "mesaj",
  "not",
];

// İlan özellikleri — eşleştirmede talebin istediği özelliklerle karşılaştırılır.
export const FEATURES = [
  "asansör",
  "otopark",
  "balkon",
  "site içi",
  "havuz",
  "eşyalı",
  "doğalgaz",
  "krediye uygun",
  "güvenlik",
  "bahçe",
] as const;

export const ROOM_OPTIONS = [
  "Stüdyo",
  "1+0",
  "1+1",
  "2+1",
  "3+1",
  "3+2",
  "4+1",
  "4+2",
  "5+1",
  "6+1",
];

// Tüm tarih/saat biçimleri bu saat diliminde yazılır: sunucu UTC'de çalışsa bile
// (Vercel/Railway) ekrandaki saat Türkiye saati olur ve sunucu ile tarayıcı aynı
// metni üretir (aksi halde React hydration uyuşmazlığı).
export const TZ = "Europe/Istanbul";

export function currencySymbol(c: Currency) {
  return c === "USD" ? "$" : c === "EUR" ? "€" : "₺";
}

const nf = new Intl.NumberFormat("tr-TR");

export function formatMoney(amount: number, currency: Currency) {
  return `${currencySymbol(currency)}${nf.format(amount)}`;
}

export function formatNumber(n: number) {
  return nf.format(n);
}
