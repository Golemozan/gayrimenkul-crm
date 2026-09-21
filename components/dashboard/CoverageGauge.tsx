/** Yarım daire, çentikli gösterge. pct 0-100. */
export default function CoverageGauge({ pct }: { pct: number }) {
  const TICKS = 40;
  const filled = Math.round((pct / 100) * TICKS);
  const cx = 110;
  const cy = 108;
  const r1 = 78;
  const r2 = 100;

  return (
    <svg viewBox="0 0 220 118" className="mx-auto w-full max-w-[260px]" aria-hidden>
      {Array.from({ length: TICKS }, (_, i) => {
        // 180° → 0°, soldan sağa
        const a = Math.PI - (i / (TICKS - 1)) * Math.PI;
        const cos = Math.cos(a);
        const sin = Math.sin(a);
        return (
          <line
            key={i}
            x1={cx + r1 * cos}
            y1={cy - r1 * sin}
            x2={cx + r2 * cos}
            y2={cy - r2 * sin}
            strokeWidth={4}
            strokeLinecap="round"
            className={i < filled ? "stroke-emerald-500" : "stroke-slate-200 dark:stroke-slate-700"}
          />
        );
      })}
    </svg>
  );
}
