// Domain types — DB şeması (supabase/schema.sql) ile birebir.

export type ListingType = "satılık" | "kiralık";
export type PropertyKind = "daire" | "villa" | "arsa";
export type Currency = "TRY" | "USD" | "EUR";
export type PropertyStatus = "aktif" | "pasif" | "satıldı";
export type AppointmentStatus = "bekliyor" | "tamamlandı" | "iptal";
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

// NOTE: bunlar `type` alias (interface değil). supabase-js GenericTable
// Row/Insert/Update için Record<string, unknown> ister; interface'te örtük
// index signature yok, tip `never`'a düşer. Object-literal type alias geçer.
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
  budget_min: number | null;
  budget_max: number | null;
  looking_for: ListingType | null;
  stage: ClientStage;
  offer_property_id: string | null;
  offer_amount: number | null;
  notes: string | null;
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

export type Database = {
  public: {
    Tables: {
      properties: {
        Row: Property;
        Insert: Omit<Property, "id" | "created_at">;
        Update: Partial<Omit<Property, "id" | "created_at">>;
        Relationships: [];
      };
      clients: {
        Row: Client;
        Insert: Omit<Client, "id" | "created_at">;
        Update: Partial<Omit<Client, "id" | "created_at">>;
        Relationships: [];
      };
      appointments: {
        Row: Appointment;
        Insert: Omit<Appointment, "id" | "created_at">;
        Update: Partial<Omit<Appointment, "id" | "created_at">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
