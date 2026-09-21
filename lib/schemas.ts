// Sunucu tarafı doğrulama — client'tan gelen her şey buradan geçer.
import { z } from "zod";
import {
  ACTIVITY_KINDS,
  APPOINTMENT_STATUSES,
  CURRENCIES,
  DEMAND_STATUSES,
  FEATURES,
  LISTING_TYPES,
  PROPERTY_KINDS,
  PROPERTY_STATUSES,
} from "@/lib/constants";
import { CLIENT_STAGES } from "@/types";

const text = (max = 500) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((s) => (s === "" ? null : s))
    .nullable()
    .optional()
    .transform((v) => v ?? null);

const num = (label: string) =>
  z
    .number({ invalid_type_error: `${label} sayı olmalı` })
    .finite()
    .nonnegative(`${label} negatif olamaz`)
    .nullable()
    .optional()
    .transform((v) => v ?? null);

const enumOf = <T extends string>(vals: readonly T[], label: string) =>
  z.enum(vals as [T, ...T[]], { errorMap: () => ({ message: `Geçersiz ${label}` }) });

const feature = enumOf(FEATURES, "özellik");

export const propertySchema = z.object({
  title: z.string().trim().min(1, "Başlık zorunlu").max(200),
  type: enumOf(LISTING_TYPES, "ilan tipi"),
  property_type: enumOf(PROPERTY_KINDS, "gayrimenkul türü"),
  price: z.number({ invalid_type_error: "Fiyat zorunlu" }).finite().nonnegative(),
  currency: enumOf(CURRENCIES, "para birimi"),
  rooms: text(20),
  area_m2: num("Alan"),
  location: text(200),
  district: text(100),
  city: text(100),
  description: text(5000),
  images: z.array(z.string().max(300)).max(30),
  features: z.array(feature).max(FEATURES.length),
  listing_url: text(500).refine(
    (v) => v == null || /^https?:\/\//i.test(v),
    "İlan linki http(s):// ile başlamalı"
  ),
  owner_name: text(120),
  owner_phone: text(40),
  status: enumOf(PROPERTY_STATUSES, "durum"),
});

export const clientSchema = z.object({
  full_name: z.string().trim().min(1, "Ad soyad zorunlu").max(120),
  phone: text(40),
  email: text(160).refine(
    (v) => v == null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    "E-posta geçersiz"
  ),
  stage: enumOf(CLIENT_STAGES, "aşama"),
  offer_property_id: text(64),
  offer_amount: num("Teklif tutarı"),
  notes: text(5000),
});

export const demandSchema = z
  .object({
    client_id: z.string().min(1),
    type: enumOf(LISTING_TYPES, "ilan tipi"),
    property_types: z.array(enumOf(PROPERTY_KINDS, "tür")).max(PROPERTY_KINDS.length),
    city: text(100),
    districts: z.array(z.string().trim().min(1).max(100)).max(50),
    budget_min: num("Bütçe min"),
    budget_max: num("Bütçe max"),
    currency: enumOf(CURRENCIES, "para birimi"),
    rooms_min: z.number().int().min(1).max(20).nullable().optional().transform((v) => v ?? null),
    area_min: num("m² min"),
    area_max: num("m² max"),
    features: z.array(feature).max(FEATURES.length),
    status: enumOf(DEMAND_STATUSES, "durum"),
    notes: text(2000),
  })
  .refine(
    (d) => d.budget_min == null || d.budget_max == null || d.budget_min <= d.budget_max,
    "Bütçe min, max'tan büyük olamaz"
  )
  .refine(
    (d) => d.area_min == null || d.area_max == null || d.area_min <= d.area_max,
    "m² min, max'tan büyük olamaz"
  )
  .refine((d) => d.districts.length === 0 || d.city != null, "İlçe seçmek için önce il seçin");

export const activitySchema = z.object({
  client_id: z.string().min(1),
  property_id: text(64),
  kind: enumOf(ACTIVITY_KINDS, "aktivite türü"),
  body: text(5000),
  occurred_at: z
    .string()
    .refine((s) => !Number.isNaN(Date.parse(s)), "Tarih geçersiz"),
});

export const appointmentSchema = z.object({
  client_id: text(64),
  property_id: text(64),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tarih zorunlu"),
  time: text(8).refine((v) => v == null || /^\d{2}:\d{2}/.test(v), "Saat geçersiz"),
  notes: text(2000),
  status: enumOf(APPOINTMENT_STATUSES, "durum"),
});

export const credentialsSchema = z.object({
  username: z.string().trim().min(3, "Kullanıcı adı en az 3 karakter").max(40),
  password: z.string().min(8, "Şifre en az 8 karakter").max(200),
});
