"use server";

import { assertUser } from "@/lib/auth";
import { allProperties } from "@/lib/db/properties";
import { allClients } from "@/lib/db/clients";
import { allDemandsWithClient } from "@/lib/db/demands";
import { listAppointments } from "@/lib/db/appointments";

export type ExportTable = "properties" | "clients" | "demands" | "appointments";

/** Excel için Türkçe başlıklı düz satırlar. */
export async function exportRows(table: ExportTable) {
  await assertUser();
  if (table === "properties")
    return allProperties().map((r) => ({
      Başlık: r.title,
      Tip: r.type,
      Tür: r.property_type,
      Fiyat: r.price,
      "Para Birimi": r.currency,
      Oda: r.rooms,
      "Alan (m²)": r.area_m2,
      Şehir: r.city,
      İlçe: r.district,
      Konum: r.location,
      Özellikler: r.features.join(", "),
      Durum: r.status,
      "Tapu Sahibi": r.owner_name,
      "Tapu Telefon": r.owner_phone,
      "İlan Linki": r.listing_url,
    }));
  if (table === "clients")
    return allClients().map((r) => ({
      "Ad Soyad": r.full_name,
      Telefon: r.phone,
      "E-posta": r.email,
      Aşama: r.stage,
      "Teklif Tutarı": r.offer_amount,
      Notlar: r.notes,
    }));
  if (table === "demands")
    return allDemandsWithClient().map((r) => ({
      Müşteri: r.full_name,
      Tip: r.type,
      Türler: r.property_types.join(", "),
      İl: r.city,
      İlçeler: r.districts.join(", "),
      "Bütçe Min": r.budget_min,
      "Bütçe Max": r.budget_max,
      "Para Birimi": r.currency,
      "Min Oda": r.rooms_min,
      "m² Min": r.area_min,
      "m² Max": r.area_max,
      Özellikler: r.features.join(", "),
      Durum: r.status,
    }));
  return listAppointments().map((r) => ({
    Tarih: r.date,
    Saat: r.time,
    Müşteri: r.client_name,
    İlan: r.property_title,
    Durum: r.status,
    Not: r.notes,
  }));
}
