"use client";

import { TZ } from "@/lib/constants";
import { Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Point = { day: string; current: number; previous: number };

const dayLabel = (d: string) =>
  new Date(`${d}T12:00`).toLocaleDateString("tr-TR", { timeZone: TZ, day: "numeric", month: "short" });

// Grafik renkleri Tailwind token'larıyla aynı: brand #2563eb, slate-400 #94a3b8.
const BRAND = "#2563eb";
const MUTED = "#94a3b8";

function TipBox({ active, payload }: { active?: boolean; payload?: { payload: Point }[] }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md dark:border-slate-700 dark:bg-slate-900">
      <p className="mb-1 font-semibold text-slate-900 dark:text-slate-100">{dayLabel(p.day)}</p>
      <p className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
        <span className="h-0.5 w-3 rounded bg-brand" /> <b className="tabular-nums">{p.current}</b> bu dönem
      </p>
      <p className="flex items-center gap-1.5 text-slate-400">
        <span className="h-0.5 w-3 rounded border-t border-dashed border-slate-400" /> <b className="tabular-nums">{p.previous}</b> önceki dönem
      </p>
    </div>
  );
}

export default function MatchTrendChart({ data }: { data: Point[] }) {
  const step = Math.max(1, Math.round(data.length / 5));
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="matchFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BRAND} stopOpacity={0.18} />
              <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={MUTED} strokeOpacity={0.2} />
          <XAxis
            dataKey="day"
            tickFormatter={dayLabel}
            interval={step - 1}
            tick={{ fontSize: 11, fill: MUTED }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} />
          <Tooltip content={<TipBox />} cursor={{ stroke: MUTED, strokeDasharray: "3 3" }} />
          <Line type="monotone" dataKey="previous" stroke={MUTED} strokeDasharray="4 4" strokeWidth={1.5} dot={false} isAnimationActive={false} />
          <Area type="monotone" dataKey="current" stroke={BRAND} strokeWidth={2} fill="url(#matchFill)" dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
