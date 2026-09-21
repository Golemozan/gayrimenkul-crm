import Link from "next/link";
import { Search } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { Card, EmptyState } from "@/components/primitives";
import { listProperties } from "@/lib/db/properties";
import { listClients } from "@/lib/db/clients";
import { formatMoney } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q ?? "").trim().slice(0, 100);
  const props = q ? listProperties({ q }, 1, 20) : { rows: [], total: 0 };
  const clients = q ? listClients({ q }, 1, 20) : { rows: [], total: 0 };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Arama" title={q ? `“${q}”` : "Ara"} count={props.total + clients.total} unit="sonuç" />

      {!q || props.total + clients.total === 0 ? (
        <Card>
          <EmptyState icon={<Search className="h-5 w-5" />} title={q ? "Sonuç bulunamadı" : "Aramak için yukarıya yazın"}>
            İlan başlığı, il/ilçe, tapu sahibi, müşteri adı, telefon veya e-posta ile arayabilirsiniz.
          </EmptyState>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card title={`Müşteriler (${clients.total})`}>
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {clients.rows.map((c) => (
                <li key={c.id}>
                  <Link href={`/clients/${c.id}`} className="flex min-h-12 items-center justify-between gap-3 px-5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-slate-900 dark:text-slate-100">{c.full_name}</span>
                      <span className="block truncate text-xs text-slate-400">{[c.phone, c.email].filter(Boolean).join(" · ") || "—"}</span>
                    </span>
                    <StatusBadge value={c.stage} />
                  </Link>
                </li>
              ))}
              {clients.total === 0 ? <li className="px-5 py-6 text-center text-sm text-slate-400">Eşleşen müşteri yok</li> : null}
            </ul>
          </Card>
          <Card title={`İlanlar (${props.total})`}>
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {props.rows.map((p) => (
                <li key={p.id}>
                  <Link href={`/properties/${p.id}`} className="flex min-h-12 items-center justify-between gap-3 px-5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-slate-900 dark:text-slate-100">{p.title}</span>
                      <span className="block truncate text-xs text-slate-400">{[p.district, p.city].filter(Boolean).join(", ") || "—"}</span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-700 dark:text-slate-200">{formatMoney(p.price, p.currency)}</span>
                  </Link>
                </li>
              ))}
              {props.total === 0 ? <li className="px-5 py-6 text-center text-sm text-slate-400">Eşleşen ilan yok</li> : null}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
