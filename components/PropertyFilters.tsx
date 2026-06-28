import Link from "next/link";

const inputCls =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100";

type P = Record<string, string | undefined>;

export default function PropertyFilters({ params }: { params: P }) {
  const active =
    params.q ||
    params.type ||
    params.property_type ||
    params.status ||
    params.minPrice ||
    params.maxPrice;

  return (
    <form
      method="get"
      action="/properties"
      className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2 lg:grid-cols-6"
    >
      <input
        name="q"
        defaultValue={params.q ?? ""}
        placeholder="Ara (başlık, şehir, tapu sahibi)"
        className={`${inputCls} sm:col-span-2 lg:col-span-2`}
      />
      <select name="type" defaultValue={params.type ?? ""} className={inputCls}>
        <option value="">Tip (hepsi)</option>
        <option value="satılık">satılık</option>
        <option value="kiralık">kiralık</option>
      </select>
      <select
        name="property_type"
        defaultValue={params.property_type ?? ""}
        className={inputCls}
      >
        <option value="">Tür (hepsi)</option>
        <option value="daire">daire</option>
        <option value="villa">villa</option>
        <option value="arsa">arsa</option>
      </select>
      <select
        name="status"
        defaultValue={params.status ?? ""}
        className={inputCls}
      >
        <option value="">Durum (hepsi)</option>
        <option value="aktif">aktif</option>
        <option value="pasif">pasif</option>
        <option value="satıldı">satıldı</option>
      </select>
      <div className="flex gap-2">
        <input
          name="minPrice"
          type="number"
          defaultValue={params.minPrice ?? ""}
          placeholder="Min ₺"
          className={`${inputCls} w-full`}
        />
        <input
          name="maxPrice"
          type="number"
          defaultValue={params.maxPrice ?? ""}
          placeholder="Max ₺"
          className={`${inputCls} w-full`}
        />
      </div>

      <div className="flex gap-2 sm:col-span-2 lg:col-span-6">
        <button
          type="submit"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
        >
          Filtrele
        </button>
        {active ? (
          <Link
            href="/properties"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Temizle
          </Link>
        ) : null}
      </div>
    </form>
  );
}
