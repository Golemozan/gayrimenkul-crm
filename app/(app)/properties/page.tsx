import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import PropertyForm from "@/components/PropertyForm";
import PropertyFilters from "@/components/PropertyFilters";
import Pagination from "@/components/Pagination";
import DeleteButton from "@/components/DeleteButton";
import ExportButton from "@/components/ExportButton";
import StatusBadge from "@/components/StatusBadge";
import { HomeIcon } from "@/components/icons";
import { listProperties } from "@/lib/db/properties";
import type { Property } from "@/types";

export const dynamic = "force-dynamic";

const nf = new Intl.NumberFormat("tr-TR");
const PAGE_SIZE = 10;

function price(p: Property) {
  const sym = p.currency === "USD" ? "$" : p.currency === "EUR" ? "€" : "₺";
  return `${sym}${nf.format(p.price)}`;
}

function clean(v: string | string[] | undefined) {
  const s = Array.isArray(v) ? v[0] : v;
  return s?.trim() || undefined;
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const params = {
    q: clean(searchParams.q),
    type: clean(searchParams.type),
    property_type: clean(searchParams.property_type),
    status: clean(searchParams.status),
    minPrice: clean(searchParams.minPrice),
    maxPrice: clean(searchParams.maxPrice),
    page: clean(searchParams.page),
  };
  const page = Math.max(1, Number(params.page) || 1);

  const num = (v?: string) => (v && !Number.isNaN(Number(v)) ? Number(v) : undefined);
  const { rows: properties, total } = listProperties(
    {
      q: params.q,
      type: params.type,
      property_type: params.property_type,
      status: params.status,
      minPrice: num(params.minPrice),
      maxPrice: num(params.maxPrice),
    },
    page,
    PAGE_SIZE
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Portföy"
        title="İlanlar"
        count={total}
        unit="ilan"
        action={
          <ExportButton
            table="properties"
            filename="ilanlar"
            label="Excel'e Aktar"
          />
        }
      />

      <PropertyFilters params={params} />
      <PropertyForm defaultOpen={searchParams.yeni === "1"} />


      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Görsel</th>
              <th className="px-4 py-3 font-medium">Başlık</th>
              <th className="px-4 py-3 font-medium">Tür</th>
              <th className="px-4 py-3 font-medium">Konum</th>
              <th className="px-4 py-3 font-medium">Detay</th>
              <th className="px-4 py-3 font-medium">Fiyat</th>
              <th className="px-4 py-3 font-medium">İlan</th>
              <th className="px-4 py-3 font-medium">Durum</th>
              <th className="px-4 py-3 font-medium">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {properties.map((p) => (
              <tr
                key={p.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
              >
                <td className="px-4 py-3">
                  {p.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.image_url}
                      alt={p.title}
                      className="h-12 w-16 rounded-md object-cover"
                    />
                  ) : (
                    <span className="flex h-12 w-16 items-center justify-center rounded-md bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600">
                      <HomeIcon className="h-5 w-5" />
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/properties/${p.id}`}
                    className="font-medium text-slate-900 hover:text-brand dark:text-slate-100 dark:hover:text-brand-light"
                  >
                    {p.title}
                  </Link>
                  {p.owner_name ? (
                    <div className="text-xs text-slate-400 dark:text-slate-500">
                      Tapu: {p.owner_name}
                      {p.owner_phone ? ` · ${p.owner_phone}` : ""}
                    </div>
                  ) : null}
                </td>
                <td className="px-4 py-3 capitalize text-slate-600 dark:text-slate-300">
                  {p.property_type}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  {[p.city, p.district].filter(Boolean).join(" / ") || "—"}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  {[p.rooms, p.area_m2 ? `${nf.format(p.area_m2)} m²` : null]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </td>
                <td className="px-4 py-3 font-medium tabular-nums text-slate-900 dark:text-slate-100">
                  {price(p)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge value={p.type} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge value={p.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/properties/${p.id}`}
                      className="text-sm font-medium text-slate-600 hover:text-brand dark:text-slate-300"
                    >
                      Detay
                    </Link>
                    <Link
                      href={`/properties/${p.id}/edit`}
                      className="text-sm font-medium text-brand hover:underline dark:text-brand-light"
                    >
                      Düzenle
                    </Link>
                    <DeleteButton
                      kind="property"
                      id={p.id}
                      confirmText={`"${p.title}" ilanını silmek istediğinize emin misiniz?`}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {properties.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
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
        basePath="/properties"
        params={params}
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
      />
    </div>
  );
}
