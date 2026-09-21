import { cn } from "@/lib/utils";

const DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

/** Haftanın günlerine göre müşteri teması. En yoğun gün vurgulanır. */
export default function WeekdayBars({ counts }: { counts: number[] }) {
  const max = Math.max(...counts);
  const peak = max > 0 ? counts.indexOf(max) : -1;

  return (
    <div>
      <div className="flex h-40 items-end justify-between gap-2" role="img" aria-label={`Haftalık yoğunluk: ${DAYS.map((d, i) => `${d} ${counts[i]}`).join(", ")}`}>
        {counts.map((n, i) => {
          // Boş gün de görünür kalsın: en az %12 yükseklik, soluk.
          const h = max > 0 ? Math.max(12, (n / max) * 100) : 12;
          return (
            <div key={DAYS[i]} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
              {i === peak ? <span className="text-xs font-bold tabular-nums text-slate-900 dark:text-slate-100">{n}</span> : null}
              <div
                title={`${DAYS[i]}: ${n}`}
                style={{ height: `${h}%` }}
                className={cn(
                  "w-full max-w-9 rounded-lg",
                  i === peak ? "bg-brand" : "bg-slate-200/80 dark:bg-slate-700/70"
                )}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between gap-2">
        {DAYS.map((d, i) => (
          <span key={d} className={cn("flex-1 text-center text-xs", i === peak ? "font-semibold text-brand dark:text-brand-light" : "text-slate-400")}>
            {d}
          </span>
        ))}
      </div>
    </div>
  );
}
