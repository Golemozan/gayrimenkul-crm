import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import StageMover from "@/components/StageMover";
import { allClients } from "@/lib/db/clients";
import { activeDemandsByClient } from "@/lib/db/demands";
import { demandSummary } from "@/lib/demandText";
import { CLIENT_STAGES } from "@/types";

export const dynamic = "force-dynamic";

const stageColor: Record<string, string> = {
  yeni: "border-t-slate-400",
  ilgili: "border-t-sky-500",
  görüştü: "border-t-indigo-500",
  teklif: "border-t-amber-500",
  kazanıldı: "border-t-emerald-500",
  kaybedildi: "border-t-rose-500",
};

export default function PipelinePage() {
  const clients = allClients();
  const demands = activeDemandsByClient(clients.map((c) => c.id));
  const byStage = (s: string) => clients.filter((c) => c.stage === s);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="CRM" title="Satış Hunisi" count={clients.length} unit="müşteri" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {CLIENT_STAGES.map((stage) => {
          const list = byStage(stage);
          return (
            <div key={stage} className={`rounded-xl border border-t-4 border-slate-200 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/40 ${stageColor[stage]}`}>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-bold capitalize text-slate-700 dark:text-slate-200">{stage}</span>
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium tabular-nums text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                  {list.length}
                </span>
              </div>

              <div className="space-y-2">
                {list.map((c) => {
                  const d = demands.get(c.id)?.[0];
                  return (
                    <div key={c.id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/clients/${c.id}`} className="text-sm font-semibold text-slate-900 hover:text-brand dark:text-slate-100 dark:hover:text-brand-light">
                          {c.full_name}
                        </Link>
                        <StageMover id={c.id} stage={c.stage} />
                      </div>
                      {c.phone ? <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{c.phone}</p> : null}
                      {d ? <p className="mt-1 line-clamp-2 text-xs text-brass dark:text-brass-light">{demandSummary(d)}</p> : null}
                    </div>
                  );
                })}
                {list.length === 0 ? <p className="py-4 text-center text-xs text-slate-300 dark:text-slate-600">boş</p> : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
