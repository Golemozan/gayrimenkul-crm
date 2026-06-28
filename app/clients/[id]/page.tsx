import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import DeleteButton from "@/components/DeleteButton";
import { HomeIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/server";
import type { Client, Property } from "@/types";

export const dynamic = "force-dynamic";

const nf = new Intl.NumberFormat("tr-TR");

function sym(c: Property["currency"]) {
  return c === "USD" ? "$" : c === "EUR" ? "€" : "₺";
}

export default async function ClientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !data) notFound();
  const c = data as Client;

  // Akıllı eşleştirme: aktif ilanlar, aradığı tip + bütçe aralığı
  let mq = supabase.from("properties").select("*").eq("status", "aktif");
  if (c.looking_for) mq = mq.eq("type", c.looking_for);
  if (c.budget_min != null) mq = mq.gte("price", c.budget_min);
  if (c.budget_max != null) mq = mq.lte("price", c.budget_max);
  const { data: matchData } = await mq
    .order("price", { ascending: true })
    .limit(20);
  const matches = (matchData ?? []) as Property[];

  const criteria = [
    c.looking_for ? `Tip: ${c.looking_for}` : null,
    c.budget_min != null ? `Min ₺${nf.format(c.budget_min)}` : null,
    c.budget_max != null ? `Max ₺${nf.format(c.budget_max)}` : null,
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Müşteri" title={c.full_name} />
      <div className="flex items-center justify-between">
        <Link
          href="/clients"
          className="text-sm font-medium text-brand hover:underline dark:text-brand-light"
        >
          ← Müşterilere dön
        </Link>
        <DeleteButton
          table="clients"
          id={c.id}
          confirmText={`"${c.full_name}" müşterisini silmek istediğinize emin misiniz?`}
          label="Müşteriyi Sil"
        />
      </div>

      {/* Bilgi kartı */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge value={c.stage} />
          {c.looking_for ? <StatusBadge value={c.looking_for} /> : null}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
          <Info label="Telefon" value={c.phone} />
          <Info label="E-posta" value={c.email} />
          <Info
            label="Bütçe"
            value={
              c.budget_min == null && c.budget_max == null
                ? null
                : `₺${nf.format(c.budget_min ?? 0)} – ₺${nf.format(
                    c.budget_max ?? 0
                  )}`
            }
          />
        </div>
        {c.notes ? (
          <p className="mt-3 whitespace-pre-wrap border-t border-slate-100 pt-3 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
            {c.notes}
          </p>
        ) : null}
      </div>

      {/* Eşleşen ilanlar */}
      <div>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Uygun İlanlar{" "}
            <span className="text-sm font-normal text-slate-400">
              ({matches.length})
            </span>
          </h2>
          {criteria.length ? (
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Kriter: {criteria.join(" · ")}
            </p>
          ) : null}
        </div>

        {criteria.length === 0 ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
            Eşleştirme için müşteriye “aradığı tip” ve/veya bütçe girin.
          </p>
        ) : matches.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500">
            Kriterlere uyan aktif ilan yok.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map((p) => (
              <Link
                key={p.id}
                href={`/properties/${p.id}`}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-brand dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-light"
              >
                {p.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.image_url}
                    alt={p.title}
                    className="h-36 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-36 w-full items-center justify-center bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-600">
                    <HomeIcon className="h-8 w-8" />
                  </div>
                )}
                <div className="p-3">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {p.title}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {[p.property_type, p.city].filter(Boolean).join(" · ")}
                  </p>
                  <p className="mt-1 text-sm font-bold tabular-nums text-brand dark:text-brand-light">
                    {sym(p.currency)}
                    {nf.format(p.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-slate-400 dark:text-slate-500">{label}</p>
      <p className="font-medium text-slate-900 dark:text-slate-100">
        {value || "—"}
      </p>
    </div>
  );
}
