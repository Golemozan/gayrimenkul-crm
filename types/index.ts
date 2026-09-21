// Domain types — DB şeması (lib/db/schema.sql) ile birebir.
// JSON kolonlar (images, features, property_types, districts, reasons) repo
// katmanında parse edilir; burada dizi olarak görünürler.

export type ListingType = "satılık" | "kiralık";
export type PropertyKind = "daire" | "villa" | "arsa";
export type Currency = "TRY" | "USD" | "EUR";
export type PropertyStatus = "aktif" | "pasif" | "satıldı";
export type AppointmentStatus = "bekliyor" | "tamamlandı" | "iptal";
export type DemandStatus = "aktif" | "pasif" | "karşılandı";
export type MatchStatus = "yeni" | "iletildi" | "ilgileniyor" | "ilgilenmedi";
export type ActivityKind =
  | "arama"
  | "görüşme"
  | "yer gösterme"
  | "mesaj"
  | "not";
export type ClientStage =
  | "yeni"
  | "ilgili"
  | "görüştü"
  | "teklif"
  | "kazanıldı"
  | "kaybedildi";

export const CLIENT_STAGES: ClientStage[] = [
  "yeni",
  "ilgili",
  "görüştü",
  "teklif",
  "kazanıldı",
  "kaybedildi",
];

export type Property = {
  id: string;
  title: string;
  type: ListingType;
  property_type: PropertyKind;
  price: number;
  currency: Currency;
  rooms: string | null;
  area_m2: number | null;
  location: string | null;
  district: string | null;
  city: string | null;
  description: string | null;
  image_url: string | null;
  images: string[];
  features: string[];
  listing_url: string | null;
  owner_name: string | null;
  owner_phone: string | null;
  status: PropertyStatus;
  created_at: string;
};

export type Client = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  stage: ClientStage;
  offer_property_id: string | null;
  offer_amount: number | null;
  notes: string | null;
  created_at: string;
};

export type Demand = {
  id: string;
  client_id: string;
  type: ListingType;
  property_types: PropertyKind[];
  city: string | null;
  districts: string[];
  budget_min: number | null;
  budget_max: number | null;
  currency: Currency;
  rooms_min: number | null;
  area_min: number | null;
  area_max: number | null;
  features: string[];
  status: DemandStatus;
  notes: string | null;
  created_at: string;
};

export type Match = {
  id: string;
  demand_id: string;
  property_id: string;
  score: number;
  reasons: string[];
  misses: string[];
  trigger: "ilan" | "talep";
  status: MatchStatus;
  seen_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Activity = {
  id: string;
  client_id: string;
  property_id: string | null;
  kind: ActivityKind;
  body: string | null;
  occurred_at: string;
  created_at: string;
};

export type Appointment = {
  id: string;
  client_id: string | null;
  property_id: string | null;
  date: string;
  time: string | null;
  notes: string | null;
  status: AppointmentStatus;
  created_at: string;
};
