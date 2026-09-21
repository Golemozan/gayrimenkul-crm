import type {
  AppointmentStatus,
  ClientStage,
  DemandStatus,
  ListingType,
  MatchStatus,
  PropertyStatus,
} from "@/types";

const map: Record<string, string> = {
  // property status
  aktif: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  pasif: "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
  satıldı: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  // listing / looking_for
  satılık: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  kiralık: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  // appointment status
  bekliyor: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  tamamlandı:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  iptal: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  // client pipeline stage
  yeni: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
  ilgili: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  görüştü: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  teklif: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  kazanıldı:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  kaybedildi: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  // demand status
  karşılandı:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  // match status
  iletildi: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  ilgileniyor:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  ilgilenmedi: "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
};

export default function StatusBadge({
  value,
}: {
  value:
    | PropertyStatus
    | ListingType
    | AppointmentStatus
    | ClientStage
    | DemandStatus
    | MatchStatus;
}) {
  const cls =
    map[value] ??
    "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${cls}`}
    >
      {value}
    </span>
  );
}
