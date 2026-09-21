import Link from "next/link";
import ClientForm from "@/components/ClientForm";
import ClientFilters from "@/components/ClientFilters";
import Pagination from "@/components/Pagination";
import DeleteButton from "@/components/DeleteButton";
import ExportButton from "@/components/ExportButton";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { listClients } from "@/lib/db/clients";
import { activeDemandsByClient } from "@/lib/db/demands";
import { propertyOptions } from "@/lib/db/properties";
import { db } from "@/lib/db";
import { demandSummary } from "@/lib/demandText";
import { formatNumber } from "@/lib/constants";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

function clean(v: string | string[] | undefined) {
  const s = Array.isArray(v) ? v[0] : v;
  return s?.trim() || undefined;
}

function matchCounts(ids: string[]) {
  if (ids.length === 0) return new Map<string, number>();
  const rows = db()
    .prepare(
      `SELECT d.client_id id, COUNT(*) n FROM matches m JOIN demands d ON d.id = m.demand_id
       WHERE m.status IN ('yeni','iletildi','ilgileniyor')
       AND d.client_id IN (${ids.map(() => "?").join(",")}) GROUP BY d.client_id`
    )
    .all(...ids) as { id: string; n: number }[];
  return new Map(rows.map((r) => [r.id, r.n]));
}

export default function ClientsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const params = {
    q: clean(searchParams.q),
    looking_for: clean(searchParams.looking_for),
    stage: clean(searchParams.stage),
    page: clean(searchParams.page),
  };
  const page = Math.max(1, Number(params.page) || 1);

  const { rows: clients, total } = listClients(params, page, PAGE_SIZE);
  const ids = clients.map((c) => c.id);
  const demands = activeDemandsByClient(ids);
  const counts = matchCounts(ids);
  const properties = propertyOptions();
  const propTitle = new Map(properties.map((p) => [p.id, p.title]));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CRM"
        title="Müşteriler"
        count={total}
        unit="kayıt"
        action={<ExportButton table="clients" filename="musteriler" label="Excel'e Aktar" />}
      />

      <ClientFilters params={params} />
      <ClientForm properties={properties.map((p) => ({ value: p.id, label: p.title }))} />

      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Ad Soyad</th>
              <th className="px-4 py-3 font-medium">İletişim</th>
              <th className="px-4 py-3 font-medium">Aradığı</th>
              <th className="px-4 py-3 font-medium">Eşleşme</th>
              <th className="px-4 py-3 font-medium">Aşama</th>
              <th className="px-4 py-3 font-medium">Teklif</th>
              <th className="px-4 py-3 font-medium">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {clients.map((c) => {
              const ds = demands.get(c.id) ?? [];
              const n = counts.get(c.id) ?? 0;
              return (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3">
                    <Link href={`/clients/${c.id}`} className="font-medium text-slate-900 hover:text-brand dark:text-slate-100 dark:hover:text-brand-light">
                      {c.full_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    <div>{c.phone ?? "—"}</div>
                    <div className="text-xs text-slate-400 dark:text-slate-500">{c.email ?? ""}</div>
                  </td>
                  <td className="max-w-[280px] px-4 py-3 text-slate-600 dark:text-slate-300">
                    {ds.length ? (
                      <div className="flex items-start gap-2">
                        <StatusBadge value={ds[0].type} />
                        <span className="line-clamp-2 text-xs">
                          {demandSummary(ds[0])}
                          {ds.length > 1 ? <span className="text-slate-400"> · +{ds.length - 1} talep</span> : null}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">Aktif talep yok</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {n > 0 ? (
                      <Link href={`/clients/${c.id}`} className="inline-flex min-h-7 items-center rounded-md bg-brand/10 px-2 text-xs font-bold tabular-nums text-brand dark:bg-brand/20 dark:text-brand-light">
                        {n} ilan
                      </Link>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={c.stage} />
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {c.offer_property_id ? (
                      <div>
                        <div className="max-w-[160px] truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                          {propTitle.get(c.offer_property_id) ?? "Silinmiş ilan"}
                        </div>
                        {c.offer_amount != null ? (
                          <div className="text-xs tabular-nums text-brass dark:text-brass-light">{formatNumber(c.offer_amount)}</div>
                        ) : null}
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link href={`/clients/${c.id}`} className="inline-flex min-h-9 items-center text-sm font-medium text-brand hover:underline dark:text-brand-light">
                        Aç
                      </Link>
                      <DeleteButton kind="client" id={c.id} confirmText={`"${c.full_name}" ve tüm talepleri, geçmişi silinsin mi?`} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {clients.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-400 dark:text-slate-500">
                  {params.q || params.stage || params.looking_for ? "Filtreye uyan müşteri yok." : "Henüz müşteri yok. Üstten ekleyin."}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <Pagination basePath="/clients" params={params} page={page} pageSize={PAGE_SIZE} total={total} />
    </div>
  );
}
