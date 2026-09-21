import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Users } from "lucide-react";
import Gallery from "@/components/Gallery";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import DeleteButton from "@/components/DeleteButton";
import MatchCard from "@/components/MatchCard";
import { Card, EmptyState, LinkButton } from "@/components/primitives";
import { getProperty } from "@/lib/db/properties";
import { matchesForProperty } from "@/lib/db/matches";
import { formatMoney, formatNumber } from "@/lib/constants";

export const dynamic = "force-dynamic";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 py-2.5 text-sm last:border-0 dark:border-slate-800">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-right font-medium text-slate-900 dark:text-slate-100">{value || "—"}</span>
    </div>
  );
}

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const p = getProperty(params.id);
  if (!p) notFound();

  const matches = matchesForProperty(p.id);
  const gallery = p.images.length > 0 ? p.images : p.image_url ? [p.image_url] : [];

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="İlan" title={p.title} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/properties" className="text-sm font-medium text-brand hover:underline dark:text-brand-light">
          ← İlanlara dön
        </Link>
        <div className="flex items-center gap-3">
          {p.listing_url ? (
            <a href={p.listing_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-600 hover:text-brand dark:text-slate-300">
              İlan linki ↗
            </a>
          ) : null}
          <DeleteButton kind="property" id={p.id} redirectTo="/properties" confirmText={`"${p.title}" ilanını silmek istediğinize emin misiniz?`} />
          <LinkButton href={`/properties/${p.id}/edit`}>Düzenle</LinkButton>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Gallery images={gallery} />

        <Card className="p-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-2xl font-extrabold tabular-nums text-slate-900 dark:text-slate-100">
              {formatMoney(p.price, p.currency)}
            </span>
            <StatusBadge value={p.type} />
            <StatusBadge value={p.status} />
          </div>
          <Row label="Gayrimenkul Türü" value={<span className="capitalize">{p.property_type}</span>} />
          <Row label="Oda Sayısı" value={p.rooms} />
          <Row label="Alan" value={p.area_m2 ? `${formatNumber(p.area_m2)} m²` : null} />
          <Row label="Konum" value={[p.city, p.district, p.location].filter(Boolean).join(" / ")} />
          <Row label="Tapu Sahibi" value={p.owner_name} />
          <Row label="Tapu Telefon" value={p.owner_phone} />
          {p.features.length ? (
            <div className="flex flex-wrap gap-1.5 pt-3">
              {p.features.map((f) => (
                <span key={f} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <Check className="h-3 w-3 text-brand dark:text-brand-light" />
                  {f}
                </span>
              ))}
            </div>
          ) : null}
        </Card>
      </div>

      {p.description ? (
        <Card title="Açıklama" className="">
          <p className="whitespace-pre-wrap px-5 py-4 text-sm text-slate-600 dark:text-slate-300">{p.description}</p>
        </Card>
      ) : null}

      <section>
        <h2 className="mb-3 text-lg font-bold text-slate-900 dark:text-slate-100">
          Bu ilana uyan müşteriler <span className="text-sm font-normal text-slate-400">({matches.length})</span>
        </h2>
        {matches.length === 0 ? (
          <Card>
            <EmptyState icon={<Users className="h-5 w-5" />} title="Uyan müşteri talebi yok">
              {p.status === "aktif"
                ? "Yeni bir talep girildiğinde bu ilan otomatik olarak taranır."
                : "Yalnızca aktif ilanlar eşleştirilir."}
            </EmptyState>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {matches.map((m) => (
              <MatchCard key={m.id} match={m} perspective="property" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
