"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { HomeIcon } from "@/components/icons";
import { MessageCircle, ThumbsDown, ThumbsUp } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { Button, ScoreBadge } from "@/components/primitives";
import { updateMatch } from "@/app/actions/matches";
import { formatMoney } from "@/lib/constants";
import { waLink } from "@/lib/phone";
import { cn } from "@/lib/utils";
import type { MatchView } from "@/lib/db/matches";
import type { MatchStatus } from "@/types";
import { DEMO } from "@/lib/demo";

function firstName(full: string) {
  return full.trim().split(/\s+/)[0] ?? full;
}

function whatsappText(m: MatchView) {
  const where = [m.property_district, m.property_city].filter(Boolean).join(", ");
  const facts = [where, m.property_rooms, m.property_area ? `${m.property_area} m²` : null]
    .filter(Boolean)
    .join(" · ");
  return [
    `Merhaba ${firstName(m.client_name)},`,
    `aradığınız kriterlere uygun bir ${m.demand_type} ilan var:`,
    `${m.property_title} — ${facts}`,
    `Fiyat: ${formatMoney(m.property_price, m.property_currency)}`,
    m.property_listing_url ?? "",
    "Görmek isterseniz randevu ayarlayabilirim.",
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * perspective: "inbox" → müşteri + ilan · "client" → ilan öne çıkar · "property" → müşteri öne çıkar
 */
export default function MatchCard({
  match: m,
  perspective = "inbox",
}: {
  match: MatchView;
  perspective?: "inbox" | "client" | "property";
}) {
  const [pending, start] = useTransition();
  const wa = waLink(m.client_phone, whatsappText(m));
  const unseen = m.seen_at == null;

  function set(status: MatchStatus) {
    start(async () => {
      const res = await updateMatch(m.id, status);
      if (!res.ok) toast.error(res.error);
    });
  }

  const showProperty = perspective !== "property";
  const showClient = perspective !== "client";

  return (
    <article
      className={cn(
        "flex gap-4 rounded-2xl border bg-white p-4 dark:bg-slate-900",
        unseen && perspective === "inbox"
          ? "border-brand/40 ring-1 ring-brand/20 dark:border-brand-light/40"
          : "border-slate-200 dark:border-slate-800",
        m.status === "ilgilenmedi" && "opacity-60"
      )}
    >
      {showProperty ? (
        <Link href={`/properties/${m.property_id}`} className="hidden shrink-0 sm:block">
          {m.property_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={m.property_image} alt="" className="h-20 w-24 rounded-lg object-cover" />
          ) : (
            <span className="flex h-20 w-24 items-center justify-center rounded-lg bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-600">
              <HomeIcon className="h-6 w-6" />
            </span>
          )}
        </Link>
      ) : null}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {showClient ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {perspective === "inbox" ? "Talep sahibi " : ""}
                <Link href={`/clients/${m.client_id}`} className="font-semibold text-slate-900 hover:text-brand dark:text-slate-100 dark:hover:text-brand-light">
                  {m.client_name}
                </Link>
                {m.client_phone ? <span className="text-slate-400"> · {m.client_phone}</span> : null}
              </p>
            ) : null}
            {showProperty ? (
              <Link href={`/properties/${m.property_id}`} className="mt-0.5 block truncate text-sm font-semibold text-slate-900 hover:text-brand dark:text-slate-100 dark:hover:text-brand-light">
                {m.property_title}
              </Link>
            ) : null}
            <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
              {[
                [m.property_district, m.property_city].filter(Boolean).join(", "),
                m.property_rooms,
                formatMoney(m.property_price, m.property_currency),
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {m.status !== "yeni" ? <StatusBadge value={m.status} /> : null}
            <ScoreBadge score={m.score} />
          </div>
        </div>

        {m.reasons.length || m.misses.length ? (
          <ul className="mt-2 flex flex-wrap gap-1.5 text-xs">
            {m.reasons.map((r) => (
              <li key={`r-${r}`} className="rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                {r}
              </li>
            ))}
            {m.misses.map((r) => (
              <li key={`m-${r}`} className="rounded bg-amber-50 px-1.5 py-0.5 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
                {r}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {DEMO ? (
            <Button
              disabled={pending}
              onClick={() => {
                if (m.status === "yeni") set("iletildi");
                toast.info("Demoda WhatsApp açılmaz. Gerçek kullanımda müşteriye hazır mesajla açılır.", {
                  description: whatsappText(m),
                });
              }}
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp&apos;tan gönder
            </Button>
          ) : wa ? (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => m.status === "yeni" && set("iletildi")}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-brand px-3 text-sm font-medium text-white shadow-sm transition hover:bg-brand-dark"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp&apos;tan gönder
            </a>
          ) : (
            <span className="text-xs text-slate-400" title="Müşteri kaydına geçerli bir telefon ekleyin">
              WhatsApp için telefon yok
            </span>
          )}
          <Button variant="secondary" disabled={pending || m.status === "ilgileniyor"} onClick={() => set("ilgileniyor")}>
            <ThumbsUp className="h-4 w-4" />
            İlgileniyor
          </Button>
          <Button variant="ghost" disabled={pending || m.status === "ilgilenmedi"} onClick={() => set("ilgilenmedi")}>
            <ThumbsDown className="h-4 w-4" />
            İlgilenmedi
          </Button>
        </div>
      </div>
    </article>
  );
}
