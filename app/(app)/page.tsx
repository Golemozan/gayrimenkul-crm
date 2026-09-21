import Link from "next/link";
import {
  CalendarClock,
  CalendarDays,
  Download,
  Handshake,
  Home,
  MessagesSquare,
  Plus,
  Star,
  Trophy,
  UserPlus,
} from "lucide-react";
import KpiCard, { DeltaBadge } from "@/components/dashboard/KpiCard";
import MatchTrendChart from "@/components/dashboard/MatchTrendChart";
import WeekdayBars from "@/components/dashboard/WeekdayBars";
import CoverageGauge from "@/components/dashboard/CoverageGauge";
import { HomeIcon } from "@/components/icons";
import {
  demandCoverage,
  kpis,
  matchSeries,
  period,
  stageGroups,
  topMatchedProperties,
  weekdayLoad,
} from "@/lib/db/dashboard";
import { upcomingAppointments } from "@/lib/db/appointments";
import { formatMoney } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const RANGES = [7, 30, 90] as const;
const fmtRange = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric" });
const fmtDay = new Intl.DateTimeFormat("tr-TR", { weekday: "short", day: "numeric", month: "short" });

function Panel({
  title,
  action,
  className,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900", className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

const MoreLink = ({ href, children = "Tümü" }: { href: string; children?: React.ReactNode }) => (
  <Link href={href} className="inline-flex min-h-9 items-center text-xs font-medium text-slate-500 hover:text-brand dark:text-slate-400 dark:hover:text-brand-light">
    {children} →
  </Link>
);

export default function DashboardPage({ searchParams }: { searchParams: { r?: string } }) {
  const days = RANGES.find((r) => String(r) === searchParams.r) ?? 30;
  const p = period(days);

  const k = kpis(p);
  const series = matchSeries(p);
  const groups = stageGroups();
  const groupTotal = groups.aday + groups.surecte + groups.kazanilan;
  const week = weekdayLoad(p);
  const cov = demandCoverage();
  const covPct = cov.total ? Math.round((cov.covered / cov.total) * 100) : 0;
  const top = topMatchedProperties(5);
  const upcoming = upcomingAppointments(4);

  const segments = [
    { label: "Aday", hint: "yeni + ilgili", value: groups.aday, Icon: UserPlus, bar: "bg-brand", icon: "text-brand bg-brand/10" },
    { label: "Süreçte", hint: "görüştü + teklif", value: groups.surecte, Icon: MessagesSquare, bar: "bg-emerald-500", icon: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/15" },
    { label: "Kazanılan", hint: "kapanan satış/kira", value: groups.kazanilan, Icon: Trophy, bar: "bg-orange-500", icon: "text-orange-600 bg-orange-50 dark:bg-orange-500/15" },
  ];

  return (
    <div className="space-y-6">
      {/* Başlık + dönem */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Panel</h1>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
            <span className="hidden items-center gap-1.5 px-2.5 text-xs font-medium text-slate-600 sm:flex dark:text-slate-300">
              <CalendarDays className="h-3.5 w-3.5" />
              {fmtRange.format(p.from)} – {fmtRange.format(p.to)}
            </span>
            {RANGES.map((r) => (
              <Link
                key={r}
                href={r === 30 ? "/" : `/?r=${r}`}
                aria-current={r === days ? "true" : undefined}
                className={cn(
                  "flex h-7 items-center rounded-full px-3 text-xs font-medium transition",
                  r === days
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                )}
              >
                {r} gün
              </Link>
            ))}
          </div>
          <Link href="/settings" className="inline-flex h-9 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
            <Download className="h-4 w-4" />
            Dışa aktar
          </Link>
          <Link href="/properties?yeni=1" className="inline-flex h-9 items-center gap-1.5 rounded-full bg-brand px-4 text-sm font-medium text-white shadow-sm shadow-brand/30 transition hover:bg-brand-dark">
            <Plus className="h-4 w-4" />
            İlan ekle
          </Link>
        </div>
      </header>

      {/* KPI */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <KpiCard label="Yeni ilan" icon={Home} days={days} {...k.properties} />
        <KpiCard label="Yeni müşteri" icon={UserPlus} days={days} {...k.clients} />
        <KpiCard label="Yeni eşleşme" icon={Handshake} days={days} {...k.matches} />
        <KpiCard label="Randevu" icon={CalendarClock} days={days} {...k.appointments} />
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Sol sütun */}
        <div className="min-w-0 space-y-6 xl:col-span-2">
          <Panel title="Eşleşme akışı" action={<MoreLink href="/matches">Eşleşmeler</MoreLink>}>
            <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[200px_minmax(0,1fr)]">
              <div>
                <p className="text-[40px] font-bold leading-none tracking-tight tabular-nums text-slate-900 dark:text-slate-50">
                  {k.matches.current.toLocaleString("tr-TR")}
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">son {days} günde müşteriye uyan ilan</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                  <DeltaBadge {...k.matches} />
                  <span>önceki döneme göre</span>
                </div>
              </div>
              <MatchTrendChart data={series} />
            </div>

            <div className="mt-5 rounded-xl border border-slate-200/80 p-4 dark:border-slate-800">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Müşteriler</h3>
                <MoreLink href="/pipeline">Satış hunisi</MoreLink>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {segments.map((s) => (
                  <div key={s.label}>
                    <div className="flex items-center gap-2">
                      <span className={cn("flex h-6 w-6 items-center justify-center rounded-md", s.icon)}>
                        <s.Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-xl font-bold tabular-nums text-slate-900 dark:text-slate-50">{s.value}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {s.label} <span className="text-slate-400 dark:text-slate-500">· {s.hint}</span>
                    </p>
                    <div className="mt-2 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                      <div className={cn("h-full rounded-full", s.bar)} style={{ width: `${groupTotal ? Math.max(4, (s.value / groupTotal) * 100) : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          <Panel title="En çok talebe uyan ilanlar" action={<MoreLink href="/properties" />}>
            {top.length ? (
              <div className="-mx-5 overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="border-y border-slate-100 text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:border-slate-800">
                      <th className="px-5 py-2.5 font-medium">No</th>
                      <th className="px-2 py-2.5 font-medium">İlan</th>
                      <th className="px-2 py-2.5 text-right font-medium">Talep</th>
                      <th className="px-2 py-2.5 text-right font-medium">Fiyat</th>
                      <th className="px-5 py-2.5 text-right font-medium">Ort. puan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {top.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <td className="px-5 py-3 font-mono text-xs text-slate-400">#{t.id.slice(0, 5).toUpperCase()}</td>
                        <td className="px-2 py-3">
                          <Link href={`/properties/${t.id}`} className="flex items-center gap-3">
                            {t.image_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={t.image_url} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover" />
                            ) : (
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 dark:bg-slate-800">
                                <HomeIcon className="h-4 w-4" />
                              </span>
                            )}
                            <span className="min-w-0">
                              <span className="block max-w-[260px] truncate font-medium text-slate-900 hover:text-brand dark:text-slate-100">{t.title}</span>
                              {t.district ? <span className="block text-xs text-slate-400">{t.district}</span> : null}
                            </span>
                          </Link>
                        </td>
                        <td className="px-2 py-3 text-right tabular-nums text-slate-600 dark:text-slate-300">{t.matches} müşteri</td>
                        <td className="px-2 py-3 text-right">
                          <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold tabular-nums text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                            {formatMoney(t.price, t.currency)}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className="inline-flex items-center gap-1 text-xs font-medium tabular-nums text-slate-600 dark:text-slate-300">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            {t.avg_score}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-slate-400">
                Henüz eşleşen aktif ilan yok. Talep ve ilan girdikçe burada sıralanır.
              </p>
            )}
          </Panel>
        </div>

        {/* Sağ sütun */}
        <div className="min-w-0 space-y-6">
          <Panel title="En yoğun gün">
            <WeekdayBars counts={week} />
            <p className="mt-3 text-xs text-slate-400">Son {days} günde görüşme, arama ve randevular</p>
          </Panel>

          <Panel title="Talep karşılama">
            <div className="relative">
              <CoverageGauge pct={covPct} />
              <div className="absolute inset-x-0 bottom-0 text-center">
                <p className="text-4xl font-bold tracking-tight tabular-nums text-slate-900 dark:text-slate-50">%{covPct}</p>
              </div>
            </div>
            <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
              {cov.total
                ? `${cov.total} aktif talebin ${cov.covered} tanesine uyan ilan var`
                : "Aktif talep yok"}
            </p>
            <div className="mt-3 flex justify-center">
              <Link href="/clients" className="inline-flex h-9 items-center rounded-full border border-slate-200 px-4 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                Talepleri gör
              </Link>
            </div>
          </Panel>

          <Panel title="Yaklaşan randevular" action={<MoreLink href="/appointments" />}>
            {upcoming.length ? (
              <ul className="space-y-3">
                {upcoming.map((a) => (
                  <li key={a.id} className="flex items-center gap-3">
                    <span className="flex h-11 w-14 shrink-0 items-center justify-center rounded-lg bg-brand/[0.08] text-sm font-bold tabular-nums text-brand dark:bg-brand/15 dark:text-brand-light">
                      {a.time ? a.time.slice(0, 5) : "—"}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                        {a.client_name ?? "Müşterisiz randevu"}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        {fmtDay.format(new Date(`${a.date}T00:00`))}
                        {a.property_title ? ` · ${a.property_title}` : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-6 text-center text-sm text-slate-400">Yaklaşan randevu yok.</p>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
