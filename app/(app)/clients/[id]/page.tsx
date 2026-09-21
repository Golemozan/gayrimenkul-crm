import Link from "next/link";
import { notFound } from "next/navigation";
import { Search, Sparkles } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import MatchCard from "@/components/MatchCard";
import DemandCard from "@/components/DemandCard";
import ActivityForm from "@/components/ActivityForm";
import ActivityTimeline from "@/components/ActivityTimeline";
import ClientHeaderActions from "@/components/ClientHeaderActions";
import { AddDemandButton } from "@/components/DemandForm";
import { Card, EmptyState } from "@/components/primitives";
import { getClient } from "@/lib/db/clients";
import { demandsForClient } from "@/lib/db/demands";
import { matchesForClient } from "@/lib/db/matches";
import { activitiesForClient } from "@/lib/db/activities";
import { appointmentsForClient } from "@/lib/db/appointments";
import { getProperty, propertyOptions } from "@/lib/db/properties";
import { formatNumber } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  const c = getClient(params.id);
  if (!c) notFound();

  const demands = demandsForClient(c.id);
  const matches = matchesForClient(c.id);
  const activities = activitiesForClient(c.id);
  const appointments = appointmentsForClient(c.id);
  const options = propertyOptions().map((p) => ({ value: p.id, label: p.title }));
  const offer = c.offer_property_id ? getProperty(c.offer_property_id) : null;

  const perDemand = new Map<string, number>();
  matches.forEach((m) => perDemand.set(m.demand_id, (perDemand.get(m.demand_id) ?? 0) + 1));
  const hasActiveDemand = demands.some((d) => d.status === "aktif");

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Müşteri" title={c.full_name} />
      <Link href="/clients" className="-mt-4 inline-block text-sm font-medium text-brand hover:underline dark:text-brand-light">
        ← Müşterilere dön
      </Link>

      <ClientHeaderActions client={c} properties={options}>
        <Card className="p-5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge value={c.stage} />
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
            <Info label="Telefon" value={c.phone ? <a href={`tel:${c.phone}`} className="hover:text-brand">{c.phone}</a> : null} />
            <Info label="E-posta" value={c.email ? <a href={`mailto:${c.email}`} className="hover:text-brand">{c.email}</a> : null} />
            <Info label="Teklif verdiği ilan" value={offer ? <Link href={`/properties/${offer.id}`} className="hover:text-brand">{offer.title}</Link> : null} />
            <Info label="Teklif tutarı" value={c.offer_amount != null ? formatNumber(c.offer_amount) : null} />
          </dl>
          {c.notes ? (
            <p className="mt-4 whitespace-pre-wrap border-t border-slate-100 pt-3 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">{c.notes}</p>
          ) : null}
        </Card>
      </ClientHeaderActions>

      {/* Talepler */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Talepleri <span className="text-sm font-normal text-slate-400">({demands.length})</span>
          </h2>
        </div>
        {demands.map((d) => (
          <DemandCard key={d.id} demand={d} matchCount={perDemand.get(d.id) ?? 0} />
        ))}
        {demands.length === 0 ? (
          <Card>
            <EmptyState icon={<Search className="h-5 w-5" />} title="Henüz talep girilmemiş">
              Müşterinin ne aradığını girin; uyan ilanlar hemen ve bundan sonra her yeni ilanda otomatik bulunur.
            </EmptyState>
          </Card>
        ) : null}
        <AddDemandButton clientId={c.id} />
      </section>

      {/* Eşleşen ilanlar */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Uyan ilanlar <span className="text-sm font-normal text-slate-400">({matches.length})</span>
        </h2>
        {matches.length === 0 ? (
          <Card>
            <EmptyState icon={<Sparkles className="h-5 w-5" />} title="Uyan aktif ilan yok">
              {hasActiveDemand
                ? "Portföye kriterlere uyan bir ilan eklendiğinde burada ve Eşleşmeler sayfasında belirir."
                : "Eşleştirme için müşterinin aktif bir talebi olmalı."}
            </EmptyState>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {matches.map((m) => (
              <MatchCard key={m.id} match={m} perspective="client" />
            ))}
          </div>
        )}
      </section>

      {/* Aktivite geçmişi */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Görüşme geçmişi</h2>
        <Card>
          <ActivityForm clientId={c.id} properties={options} />
          <div className="border-t border-slate-100 dark:border-slate-800">
            <ActivityTimeline activities={activities} appointments={appointments} />
          </div>
        </Card>
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-slate-400 dark:text-slate-500">{label}</dt>
      <dd className="truncate font-medium text-slate-900 dark:text-slate-100">{value || "—"}</dd>
    </div>
  );
}
