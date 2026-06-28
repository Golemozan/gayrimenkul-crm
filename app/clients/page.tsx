import Link from "next/link";
import ClientForm from "@/components/ClientForm";
import ClientFilters from "@/components/ClientFilters";
import Pagination from "@/components/Pagination";
import DeleteButton from "@/components/DeleteButton";
import ExportButton from "@/components/ExportButton";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { createClient } from "@/lib/supabase/server";
import type { Client, Property } from "@/types";

export const dynamic = "force-dynamic";

const nf = new Intl.NumberFormat("tr-TR");
const PAGE_SIZE = 10;

function budget(c: Client) {
  if (c.budget_min == null && c.budget_max == null) return "—";
  const lo = c.budget_min != null ? `₺${nf.format(c.budget_min)}` : "…";
  const hi = c.budget_max != null ? `₺${nf.format(c.budget_max)}` : "…";
  return `${lo} - ${hi}`;
}

function clean(v: string | string[] | undefined) {
  const s = Array.isArray(v) ? v[0] : v;
  return s?.trim() || undefined;
}

export default async function ClientsPage({
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

  const supabase = createClient();

  let query = supabase.from("clients").select("*", { count: "exact" });
  if (params.q) {
    const safe = params.q.replace(/[,()%]/g, " ");
    query = query.or(
      `full_name.ilike.%${safe}%,phone.ilike.%${safe}%,email.ilike.%${safe}%`
    );
  }
  if (params.looking_for) query = query.eq("looking_for", params.looking_for);
  if (params.stage) query = query.eq("stage", params.stage);

  const [clientRes, propRes] = await Promise.all([
    query
      .order("created_at", { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1),
    supabase.from("properties").select("id, title").order("created_at", {
      ascending: false,
    }),
  ]);

  const clients = (clientRes.data ?? []) as Client[];
  const total = clientRes.count ?? 0;
  const properties = (propRes.data ?? []) as Pick<Property, "id" | "title">[];
  const propTitle = new Map(properties.map((p) => [p.id, p.title]));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CRM"
        title="Müşteriler"
        count={total}
        unit="kayıt"
        action={
          <ExportButton
            table="clients"
            filename="musteriler"
            label="Excel'e Aktar"
          />
        }
      />

      <ClientFilters params={params} />
      <ClientForm
        properties={properties.map((p) => ({ value: p.id, label: p.title }))}
      />

      {clientRes.error ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          Veri çekilemedi: {clientRes.error.message}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Ad Soyad</th>
              <th className="px-4 py-3 font-medium">İletişim</th>
              <th className="px-4 py-3 font-medium">Bütçe</th>
              <th className="px-4 py-3 font-medium">Aradığı</th>
              <th className="px-4 py-3 font-medium">Aşama</th>
              <th className="px-4 py-3 font-medium">Teklif</th>
              <th className="px-4 py-3 font-medium">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {clients.map((c) => (
              <tr
                key={c.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/clients/${c.id}`}
                    className="font-medium text-slate-900 hover:text-brand dark:text-slate-100 dark:hover:text-brand-light"
                  >
                    {c.full_name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  <div>{c.phone ?? "—"}</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">
                    {c.email ?? ""}
                  </div>
                </td>
                <td className="px-4 py-3 tabular-nums text-slate-600 dark:text-slate-300">
                  {budget(c)}
                </td>
                <td className="px-4 py-3">
                  {c.looking_for ? <StatusBadge value={c.looking_for} /> : "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge value={c.stage} />
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  {c.offer_property_id ? (
                    <div>
                      <div className="max-w-[180px] truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                        {propTitle.get(c.offer_property_id) ?? "Silinmiş ilan"}
                      </div>
                      {c.offer_amount != null ? (
                        <div className="text-xs tabular-nums text-brass dark:text-brass-light">
                          ₺{nf.format(c.offer_amount)}
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/clients/${c.id}`}
                      className="text-sm font-medium text-brand hover:underline dark:text-brand-light"
                    >
                      Eşleşmeler
                    </Link>
                    <DeleteButton
                      table="clients"
                      id={c.id}
                      confirmText={`"${c.full_name}" müşterisini silmek istediğinize emin misiniz?`}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {clients.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-slate-400 dark:text-slate-500"
                >
                  Kayıt bulunamadı.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <Pagination
        basePath="/clients"
        params={params}
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
      />
    </div>
  );
}
