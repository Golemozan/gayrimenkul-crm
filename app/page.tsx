import Link from "next/link";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import PropertyChart from "@/components/PropertyChart";
import {
  CalendarIcon,
  HomeIcon,
  TagIcon,
  UsersIcon,
} from "@/components/icons";
import { createClient } from "@/lib/supabase/server";
import type { Client, Currency, Property } from "@/types";

export const dynamic = "force-dynamic";

const nf = new Intl.NumberFormat("tr-TR");
const sym: Record<Currency, string> = { TRY: "₺", USD: "$", EUR: "€" };

function priceLabel(p: Pick<Property, "price" | "currency">) {
  return `${sym[p.currency] ?? "₺"}${nf.format(p.price)}`;
}

function budgetLabel(c: Pick<Client, "budget_min" | "budget_max">) {
  if (c.budget_min == null && c.budget_max == null) return "Bütçe belirtilmemiş";
  const lo = c.budget_min != null ? `₺${nf.format(c.budget_min)}` : "…";
  const hi = c.budget_max != null ? `₺${nf.format(c.budget_max)}` : "…";
  return `${lo} – ${hi}`;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export default async function DashboardPage() {
  const supabase = createClient();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    .toISOString()
    .slice(0, 10);

  const [
    { count: propertyCount },
    { count: clientCount },
    { count: monthAppointments },
    { count: closedCount },
    { data: recentProps },
    { data: recentClients },
    { data: allProps },
  ] = await Promise.all([
    supabase.from("properties").select("*", { count: "exact", head: true }),
    supabase.from("clients").select("*", { count: "exact", head: true }),
    supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .gte("date", monthStart)
      .lt("date", monthEnd),
    supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .eq("status", "satıldı"),
    supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("properties")
      .select("status, type")
      .returns<{ status: Property["status"]; type: Property["type"] }[]>(),
  ]);

  const listings = (recentProps ?? []) as Property[];
  const clients = (recentClients ?? []) as Client[];

  const props = allProps ?? [];
  const countBy = (key: "status" | "type", val: string) =>
    props.filter((p) => p[key] === val).length;

  const statusSegments = [
    { label: "aktif", value: countBy("status", "aktif"), color: "#10b981" },
    { label: "pasif", value: countBy("status", "pasif"), color: "#94a3b8" },
    { label: "satıldı", value: countBy("status", "satıldı"), color: "#f43f5e" },
  ];
  const typeSegments = [
    { label: "satılık", value: countBy("type", "satılık"), color: "#0ea5e9" },
    { label: "kiralık", value: countBy("type", "kiralık"), color: "#8b5cf6" },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brass dark:text-brass-light">
            Genel Bakış
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Panel
          </h1>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {now.toLocaleDateString("tr-TR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </header>

      {/* Stat cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Toplam İlan"
          value={propertyCount ?? 0}
          accent="brand"
          icon={<HomeIcon />}
        />
        <StatCard
          label="Aktif Müşteri"
          value={clientCount ?? 0}
          accent="sky"
          icon={<UsersIcon />}
        />
        <StatCard
          label="Bu Ay Randevu"
          value={monthAppointments ?? 0}
          accent="brass"
          icon={<CalendarIcon />}
        />
        <StatCard
          label="Satılan/Kiralanan"
          value={closedCount ?? 0}
          accent="slate"
          icon={<TagIcon />}
        />
      </section>

      {/* Chart */}
      <section>
        <PropertyChart status={statusSegments} types={typeSegments} />
      </section>

      {/* Recent lists */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Listings */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Son Eklenen İlanlar
            </h2>
            <Link
              href="/properties"
              className="text-xs font-medium text-brand hover:underline dark:text-brand-light"
            >
              Tümü →
            </Link>
          </div>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {listings.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40"
              >
                {p.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.image_url}
                    alt={p.title}
                    className="h-11 w-11 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand-light">
                    <HomeIcon className="h-4 w-4" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {p.title}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {[p.property_type, p.city, p.district]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold tabular-nums text-slate-900 dark:text-slate-100">
                    {priceLabel(p)}
                  </p>
                  <StatusBadge value={p.type} />
                </div>
              </li>
            ))}
            {listings.length === 0 ? (
              <li className="px-5 py-10 text-center text-sm text-slate-400 dark:text-slate-500">
                Henüz ilan yok.{" "}
                <Link
                  href="/properties"
                  className="text-brand hover:underline dark:text-brand-light"
                >
                  İlan ekle
                </Link>
              </li>
            ) : null}
          </ul>
        </div>

        {/* Clients */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Son Eklenen Müşteriler
            </h2>
            <Link
              href="/clients"
              className="text-xs font-medium text-brand hover:underline dark:text-brand-light"
            >
              Tümü →
            </Link>
          </div>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {clients.map((c) => (
              <li
                key={c.id}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brass/10 text-xs font-bold text-brass dark:bg-brass/20 dark:text-brass-light">
                  {initials(c.full_name) || "?"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {c.full_name}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {c.phone ?? "Telefon yok"} · {budgetLabel(c)}
                  </p>
                </div>
                {c.looking_for ? <StatusBadge value={c.looking_for} /> : null}
              </li>
            ))}
            {clients.length === 0 ? (
              <li className="px-5 py-10 text-center text-sm text-slate-400 dark:text-slate-500">
                Henüz müşteri yok.{" "}
                <Link
                  href="/clients"
                  className="text-brand hover:underline dark:text-brand-light"
                >
                  Müşteri ekle
                </Link>
              </li>
            ) : null}
          </ul>
        </div>
      </section>
    </div>
  );
}
