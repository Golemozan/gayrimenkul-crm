import Link from "next/link";
import { Sparkles } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import MatchCard from "@/components/MatchCard";
import MarkSeenOnView from "@/components/MarkSeenOnView";
import { Card, EmptyState } from "@/components/primitives";
import { countMatchesByStatus, listMatches, unseenCount } from "@/lib/db/matches";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function MatchesPage({ searchParams }: { searchParams: { f?: string } }) {
  const filter = searchParams.f === "tumu" ? "tümü" : "yeni";
  const matches = listMatches(filter);
  const unseen = unseenCount();
  const pendingCount = countMatchesByStatus("yeni");

  const tabs = [
    { href: "/matches", label: `Bekleyen (${pendingCount})`, active: filter === "yeni" },
    { href: "/matches?f=tumu", label: "Tümü", active: filter === "tümü" },
  ];

  return (
    <div className="space-y-6">
      <MarkSeenOnView unseen={unseen} />
      <PageHeader
        eyebrow="Otomatik eşleştirme"
        title="Eşleşmeler"
        count={matches.length}
        unit={filter === "yeni" ? "bekleyen eşleşme" : "eşleşme"}
      />

      <p className="max-w-2xl text-sm text-slate-500 dark:text-slate-400">
        Yeni bir ilan veya talep kaydedildiğinde sistem tüm aktif kayıtları tarar; uyanlar
        burada puanıyla listelenir. Yeşil etiketler tutan kriterleri, sarılar eksikleri gösterir.
      </p>

      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "-mb-px flex min-h-9 items-center border-b-2 px-3 text-sm font-medium",
              t.active
                ? "border-brand text-brand dark:border-brand-light dark:text-brand-light"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {matches.length === 0 ? (
        <Card>
          <EmptyState icon={<Sparkles className="h-5 w-5" />} title={filter === "yeni" ? "Bekleyen eşleşme yok" : "Henüz eşleşme yok"}>
            Müşterilere talep girin ve portföye ilan ekleyin; uyan her çift burada belirir.{" "}
            <Link href="/clients" className="font-medium text-brand hover:underline dark:text-brand-light">
              Müşterilere git
            </Link>
          </EmptyState>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {matches.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      )}
    </div>
  );
}
