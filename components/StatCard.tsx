import type { ReactNode } from "react";

const accents: Record<string, { bar: string; chip: string }> = {
  brand: { bar: "bg-brand", chip: "bg-brand/10 text-brand" },
  brass: { bar: "bg-brass", chip: "bg-brass/10 text-brass" },
  slate: { bar: "bg-slate-700", chip: "bg-slate-100 text-slate-700" },
  sky: { bar: "bg-sky-600", chip: "bg-sky-100 text-sky-700" },
};

export default function StatCard({
  label,
  value,
  hint,
  icon,
  accent = "brand",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  accent?: keyof typeof accents;
}) {
  const a = accents[accent] ?? accents.brand;
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      {/* ledger accent bar */}
      <span className={`absolute inset-y-0 left-0 w-1 ${a.bar}`} />
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {label}
        </p>
        {icon ? (
          <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${a.chip}`}>
            {icon}
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-3xl font-extrabold tabular-nums tracking-tight text-slate-900 dark:text-slate-100">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}
