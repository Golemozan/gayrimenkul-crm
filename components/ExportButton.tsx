"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { createClient } from "@/lib/supabase/client";

type Table = "properties" | "clients" | "appointments";

// Satırı Türkçe başlıklı düz objeye çevir.
function mapRow(table: Table, r: Record<string, unknown>) {
  if (table === "properties") {
    return {
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
      Durum: r.status,
      "Tapu Sahibi": r.owner_name,
      "Tapu Telefon": r.owner_phone,
      "İlan Linki": r.listing_url,
    };
  }
  if (table === "clients") {
    return {
      "Ad Soyad": r.full_name,
      Telefon: r.phone,
      "E-posta": r.email,
      "Bütçe Min": r.budget_min,
      "Bütçe Max": r.budget_max,
      Aradığı: r.looking_for,
      Aşama: r.stage,
      "Teklif Tutarı": r.offer_amount,
      Notlar: r.notes,
    };
  }
  return {
    Tarih: r.date,
    Saat: r.time,
    Durum: r.status,
    Not: r.notes,
  };
}

export default function ExportButton({
  table,
  filename,
  label = "Excel'e Aktar",
}: {
  table: Table;
  filename: string;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);

  async function onExport() {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order("created_at", { ascending: false });
    setLoading(false);

    if (error) {
      window.alert(`Dışa aktarılamadı: ${error.message}`);
      return;
    }
    const rows = (data ?? []).map((r) =>
      mapRow(table, r as Record<string, unknown>)
    );
    if (rows.length === 0) {
      window.alert("Aktarılacak kayıt yok.");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Veri");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  }

  return (
    <button
      onClick={onExport}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
        <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
      </svg>
      {loading ? "Hazırlanıyor…" : label}
    </button>
  );
}
