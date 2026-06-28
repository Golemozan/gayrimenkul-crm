import Link from "next/link";
import { notFound } from "next/navigation";
import Gallery from "@/components/Gallery";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { createClient } from "@/lib/supabase/server";
import type { Property } from "@/types";

export const dynamic = "force-dynamic";

const nf = new Intl.NumberFormat("tr-TR");

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 py-2.5 text-sm last:border-0 dark:border-slate-800">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-right font-medium text-slate-900 dark:text-slate-100">
        {value || "—"}
      </span>
    </div>
  );
}

export default async function PropertyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !data) notFound();
  const p = data as Property;

  const sym = p.currency === "USD" ? "$" : p.currency === "EUR" ? "€" : "₺";
  const gallery =
    p.images && p.images.length > 0
      ? p.images
      : p.image_url
        ? [p.image_url]
        : [];

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="İlan" title={p.title} />
      <div className="flex items-center justify-between">
        <Link
          href="/properties"
          className="text-sm font-medium text-brand hover:underline dark:text-brand-light"
        >
          ← İlanlara dön
        </Link>
        <div className="flex items-center gap-3">
          {p.listing_url ? (
            <a
              href={p.listing_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-slate-600 hover:text-brand dark:text-slate-300"
            >
              İlan linki ↗
            </a>
          ) : null}
          <Link
            href={`/properties/${p.id}/edit`}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
          >
            Düzenle
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Gallery images={gallery} />

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-2xl font-extrabold tabular-nums text-slate-900 dark:text-slate-100">
              {sym}
              {nf.format(p.price)}
            </span>
            <StatusBadge value={p.type} />
            <StatusBadge value={p.status} />
          </div>
          <Row label="Gayrimenkul Türü" value={<span className="capitalize">{p.property_type}</span>} />
          <Row label="Oda Sayısı" value={p.rooms} />
          <Row label="Alan" value={p.area_m2 ? `${nf.format(p.area_m2)} m²` : null} />
          <Row
            label="Konum"
            value={[p.city, p.district, p.location].filter(Boolean).join(" / ")}
          />
          <Row label="Tapu Sahibi" value={p.owner_name} />
          <Row label="Tapu Telefon" value={p.owner_phone} />
        </div>
      </div>

      {p.description ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-2 text-sm font-bold text-slate-900 dark:text-slate-100">
            Açıklama
          </h2>
          <p className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">
            {p.description}
          </p>
        </div>
      ) : null}
    </div>
  );
}
