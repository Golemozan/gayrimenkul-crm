import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Önceki döneme göre değişim. Önceki dönem 0 ise yüzde anlamsız: "ilk kayıtlar"
 * der, uydurma bir oran göstermez.
 */
export function DeltaBadge({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) {
    return current > 0 ? (
      <span className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        ilk kayıtlar
      </span>
    ) : null;
  }
  const pct = ((current - previous) / previous) * 100;
  const up = pct >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums",
        up
          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300"
          : "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300"
      )}
    >
      <Icon className="h-3 w-3" />
      {Math.abs(pct).toLocaleString("tr-TR", { maximumFractionDigits: 1 })}%
    </span>
  );
}

export default function KpiCard({
  label,
  icon: Icon,
  current,
  previous,
  days,
}: {
  label: string;
  icon: LucideIcon;
  current: number;
  previous: number;
  days: number;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</p>
        <Icon className="h-[18px] w-[18px] text-brand dark:text-brand-light" strokeWidth={2} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
        <p className="text-[28px] font-bold leading-none tracking-tight tabular-nums text-slate-900 dark:text-slate-50">
          {current.toLocaleString("tr-TR")}
        </p>
        <DeltaBadge current={current} previous={previous} />
      </div>
      <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
        önceki {days} gün: {previous.toLocaleString("tr-TR")}
      </p>
    </div>
  );
}
