import Link from "next/link";
import { CLIENT_STAGES } from "@/types";

const inputCls =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100";

type P = Record<string, string | undefined>;

export default function ClientFilters({ params }: { params: P }) {
  const active = params.q || params.looking_for || params.stage;
  return (
    <form
      method="get"
      action="/clients"
      className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2 lg:grid-cols-4"
    >
      <input
        name="q"
        defaultValue={params.q ?? ""}
        placeholder="Ara (ad, telefon, e-posta)"
        className={`${inputCls} lg:col-span-2`}
      />
      <select
        name="looking_for"
        defaultValue={params.looking_for ?? ""}
        className={inputCls}
      >
        <option value="">Aradığı (hepsi)</option>
        <option value="satılık">satılık</option>
        <option value="kiralık">kiralık</option>
      </select>
      <select
        name="stage"
        defaultValue={params.stage ?? ""}
        className={`${inputCls} capitalize`}
      >
        <option value="">Aşama (hepsi)</option>
        {CLIENT_STAGES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <div className="flex gap-2 sm:col-span-2 lg:col-span-4">
        <button
          type="submit"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
        >
          Filtrele
        </button>
        {active ? (
          <Link
            href="/clients"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Temizle
          </Link>
        ) : null}
      </div>
    </form>
  );
}
