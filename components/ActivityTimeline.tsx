import Link from "next/link";
import { CalendarClock, Eye, History, MessageCircle, Phone, StickyNote, Users } from "lucide-react";
import DeleteButton from "@/components/DeleteButton";
import StatusBadge from "@/components/StatusBadge";
import { EmptyState } from "@/components/primitives";
import type { ActivityView } from "@/lib/db/activities";
import type { AppointmentView } from "@/lib/db/appointments";
import type { ActivityKind } from "@/types";

const kindIcon: Record<ActivityKind, typeof Phone> = {
  arama: Phone,
  görüşme: Users,
  "yer gösterme": Eye,
  mesaj: MessageCircle,
  not: StickyNote,
};

type Item =
  | { t: "activity"; at: number; a: ActivityView }
  | { t: "appointment"; at: number; a: AppointmentView };

const fmt = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
const fmtDay = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric" });

/**
 * Müşteriyle yaşanan her şey tek akışta: elle girilen aktiviteler + randevular.
 * Tamamlanan randevu zaten aktivite olarak düştüğü için randevu satırı yalnız
 * bekleyen/iptal olanlar için gösterilir (çift kayıt olmasın).
 */
export default function ActivityTimeline({
  activities,
  appointments,
}: {
  activities: ActivityView[];
  appointments: AppointmentView[];
}) {
  const items: Item[] = [
    ...activities.map((a) => ({ t: "activity" as const, at: Date.parse(a.occurred_at), a })),
    ...appointments
      .filter((a) => a.status !== "tamamlandı")
      .map((a) => ({ t: "appointment" as const, at: Date.parse(`${a.date}T${(a.time ?? "00:00").slice(0, 5)}`), a })),
  ].sort((x, y) => y.at - x.at);

  if (items.length === 0)
    return (
      <EmptyState icon={<History className="h-5 w-5" />} title="Henüz kayıt yok">
        Arama, görüşme ve yer göstermeleri ekledikçe müşterinin geçmişi burada birikir.
      </EmptyState>
    );

  return (
    <ol className="relative px-5 py-4">
      {items.map((it) => {
        if (it.t === "appointment") {
          const a = it.a;
          return (
            <li key={`ap-${a.id}`} className="group relative flex gap-3 pb-5 last:pb-0">
              <Rail />
              <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brass/10 text-brass dark:bg-brass/20 dark:text-brass-light">
                <CalendarClock className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1 pt-1">
                <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                  Randevu · {fmtDay.format(new Date(`${a.date}T00:00`))}
                  {a.time ? ` ${a.time.slice(0, 5)}` : ""}
                  <StatusBadge value={a.status} />
                </p>
                {a.property_title ? (
                  <Link href={`/properties/${a.property_id}`} className="text-xs text-brand hover:underline dark:text-brand-light">
                    {a.property_title}
                  </Link>
                ) : null}
                {a.notes ? <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">{a.notes}</p> : null}
                <Link href={`/appointments/${a.id}/edit`} className="mt-1 inline-flex min-h-9 items-center text-xs font-medium text-slate-500 hover:text-brand">
                  Randevuyu düzenle
                </Link>
              </div>
            </li>
          );
        }
        const a = it.a;
        const Icon = kindIcon[a.kind];
        return (
          <li key={`ac-${a.id}`} className="group relative flex gap-3 pb-5 last:pb-0">
            <Rail />
            <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand-light">
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium capitalize text-slate-900 dark:text-slate-100">
                  {a.kind}
                  <span className="ml-2 text-xs font-normal normal-case text-slate-400">
                    {fmt.format(new Date(a.occurred_at))}
                  </span>
                </p>
                <DeleteButton kind="activity" id={a.id} label="Sil" className="text-xs text-slate-400 hover:text-rose-600 dark:text-slate-500" confirmText="Bu aktivite silinsin mi?" />
              </div>
              {a.property_title ? (
                <Link href={`/properties/${a.property_id}`} className="text-xs text-brand hover:underline dark:text-brand-light">
                  {a.property_title}
                </Link>
              ) : null}
              {a.body ? <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">{a.body}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function Rail() {
  return <span aria-hidden className="absolute left-4 top-8 bottom-0 w-px bg-slate-200 group-last:hidden dark:bg-slate-800" />;
}
