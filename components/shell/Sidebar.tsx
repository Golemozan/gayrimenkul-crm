"use client";

import { TZ } from "@/lib/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DatabaseBackup } from "lucide-react";
import { NAV_BOTTOM, NAV_MAIN, NAV_WORK, isActive, type NavItem } from "@/components/shell/nav";
import { cn } from "@/lib/utils";

export type BackupInfo = { lastAt: string | null; count: number };

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 px-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V20h14V9.5" />
          <path d="M10 20v-5h4v5" />
        </svg>
      </span>
      <span className="text-[17px] font-bold tracking-tight text-slate-900 dark:text-slate-100">EmlakCRM</span>
    </Link>
  );
}

function Item({ item, pathname, unseen, onNavigate }: { item: NavItem; pathname: string; unseen: number; onNavigate?: () => void }) {
  const active = isActive(pathname, item.href);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex min-h-9 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
        active
          ? "bg-brand/[0.08] text-brand dark:bg-brand/15 dark:text-brand-light"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
      )}
    >
      {active ? <span aria-hidden className="absolute -left-4 top-1.5 bottom-1.5 w-[3px] rounded-r bg-brand" /> : null}
      <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
      <span className="truncate">{item.label}</span>
      {item.badge === "matches" && unseen > 0 ? (
        <span className="ml-auto rounded-md bg-emerald-50 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
          {unseen > 99 ? "99+" : unseen}
        </span>
      ) : null}
    </Link>
  );
}

const fmt = new Intl.DateTimeFormat("tr-TR", { timeZone: TZ, day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default function Sidebar({
  unseen,
  backup,
  onNavigate,
}: {
  unseen: number;
  backup: BackupInfo;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col gap-6 px-4 py-5">
      <Logo />

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto" aria-label="Ana menü">
        <div className="space-y-0.5">
          {NAV_MAIN.map((i) => (
            <Item key={i.href} item={i} pathname={pathname} unseen={unseen} onNavigate={onNavigate} />
          ))}
        </div>
        <div className="space-y-0.5">
          <p className="px-3 pb-1 text-xs font-medium text-slate-400 dark:text-slate-500">Takip</p>
          {NAV_WORK.map((i) => (
            <Item key={i.href} item={i} pathname={pathname} unseen={unseen} onNavigate={onNavigate} />
          ))}
        </div>
      </nav>

      <div className="space-y-4">
        <div className="space-y-0.5">
          {NAV_BOTTOM.map((i) => (
            <Item key={i.href} item={i} pathname={pathname} unseen={unseen} onNavigate={onNavigate} />
          ))}
        </div>

        {/* Yedek durumu — referanstaki "upgrade" kartının yerinde, işe yarayan bilgi */}
        <div className="rounded-2xl bg-gradient-to-br from-brand to-brand-dark p-4 text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
            <DatabaseBackup className="h-4 w-4" />
          </span>
          <p className="mt-3 text-sm font-semibold">Verileriniz yedekte</p>
          <p className="mt-0.5 text-xs text-white/75">
            {backup.lastAt ? `Son yedek: ${fmt.format(new Date(backup.lastAt))}` : "Henüz yedek alınmadı"}
            {backup.count ? ` · ${backup.count} gün saklanıyor` : ""}
          </p>
          <a
            href="/api/backup"
            className="mt-3 flex min-h-9 items-center justify-center rounded-lg bg-white/15 text-xs font-semibold transition hover:bg-white/25"
          >
            Şimdi yedek indir
          </a>
        </div>
      </div>
    </div>
  );
}
