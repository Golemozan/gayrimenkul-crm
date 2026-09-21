// Bağımlılıksız SVG grafik (server component): durum donutu + tür barları.

type Seg = { label: string; value: number; color: string };

function Donut({ segments, total }: { segments: Seg[]; total: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="relative h-40 w-40 shrink-0">
      <svg viewBox="0 0 140 140" className="h-40 w-40 -rotate-90">
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          strokeWidth="16"
          className="stroke-slate-100 dark:stroke-slate-800"
        />
        {total > 0 &&
          segments.map((s) => {
            const len = (s.value / total) * c;
            const seg = (
              <circle
                key={s.label}
                cx="70"
                cy="70"
                r={r}
                fill="none"
                strokeWidth="16"
                stroke={s.color}
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            );
            offset += len;
            return seg;
          })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold tabular-nums text-slate-900 dark:text-slate-100">
          {total}
        </span>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          toplam ilan
        </span>
      </div>
    </div>
  );
}

function Bar({ label, value, max, color }: Seg & { max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="capitalize text-slate-600 dark:text-slate-300">
          {label}
        </span>
        <span className="tabular-nums font-medium text-slate-900 dark:text-slate-100">
          {value}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function PropertyChart({
  status,
  types,
}: {
  status: Seg[];
  types: Seg[];
}) {
  const total = status.reduce((s, x) => s + x.value, 0);
  const typeMax = Math.max(1, ...types.map((t) => t.value));

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
        İlan Dağılımı
      </h2>
      <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <Donut segments={status} total={total} />

        <div className="flex-1 space-y-4">
          {/* Durum legend */}
          <div className="space-y-2">
            {status.map((s) => (
              <div
                key={s.label}
                className="flex items-center justify-between text-sm"
              >
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <span
                    className="inline-block h-3 w-3 rounded-sm"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="capitalize">{s.label}</span>
                </span>
                <span className="tabular-nums font-medium text-slate-900 dark:text-slate-100">
                  {s.value}
                </span>
              </div>
            ))}
          </div>

          {/* Tür barları */}
          <div className="space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
            {types.map((t) => (
              <Bar key={t.label} {...t} max={typeMax} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
