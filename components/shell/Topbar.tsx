"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, LogOut, Menu, Search, Settings, X } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Sidebar, { type BackupInfo } from "@/components/shell/Sidebar";
import { logoutAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import { DEMO } from "@/lib/demo";

const iconBtn =
  "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800";

function SearchBox() {
  const router = useRouter();
  const ref = useRef<HTMLInputElement>(null);

  // Ctrl/⌘ + K → aramaya odaklan
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const q = ref.current?.value.trim();
        if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
      }}
      className="relative min-w-0 flex-1 sm:max-w-sm"
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        ref={ref}
        name="q"
        type="search"
        placeholder="İlan, müşteri, telefon ara…"
        aria-label="Ara"
        className="h-9 w-full rounded-full border border-slate-200 bg-slate-50 pl-9 pr-14 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      />
      <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 text-[10px] font-medium text-slate-400 sm:block dark:border-slate-700 dark:bg-slate-900">
        Ctrl K
      </kbd>
    </form>
  );
}

function UserMenu({ username }: { username: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const initials = username.slice(0, 2).toLocaleUpperCase("tr");

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Hesap menüsü"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand ring-2 ring-white transition hover:bg-brand/15 dark:bg-brand/20 dark:text-brand-light dark:ring-slate-900"
      >
        {initials}
      </button>
      {open ? (
        <div role="menu" className="absolute right-0 top-11 z-40 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
          <p className="truncate px-3 py-2 text-xs text-slate-400">{username}</p>
          <Link role="menuitem" href="/settings" onClick={() => setOpen(false)} className="flex min-h-9 items-center gap-2 px-3 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
            <Settings className="h-4 w-4" /> Ayarlar
          </Link>
          {DEMO ? (
            <p className="px-3 py-2 text-xs text-slate-400">Demoda çıkış yok</p>
          ) : (
          <form action={logoutAction}>
            <button role="menuitem" type="submit" className="flex min-h-9 w-full items-center gap-2 px-3 text-sm text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10">
              <LogOut className="h-4 w-4" /> Çıkış yap
            </button>
          </form>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default function Topbar({ username, unseen, backup }: { username: string; unseen: number; backup: BackupInfo }) {
  const [drawer, setDrawer] = useState(false);
  const pathname = usePathname();
  useEffect(() => setDrawer(false), [pathname]);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200/80 bg-canvas/85 px-4 backdrop-blur sm:px-6 dark:border-slate-800 dark:bg-slate-950/85">
        <button type="button" onClick={() => setDrawer(true)} className={cn(iconBtn, "lg:hidden")} aria-label="Menüyü aç">
          <Menu className="h-[18px] w-[18px]" />
        </button>
        <SearchBox />
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Link href="/matches" className={iconBtn} aria-label={unseen ? `${unseen} yeni eşleşme` : "Eşleşmeler"} title={unseen ? `${unseen} yeni eşleşme` : "Yeni eşleşme yok"}>
            <Bell className="h-[18px] w-[18px]" />
            {unseen > 0 ? <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" /> : null}
          </Link>
          <UserMenu username={username} />
        </div>
      </header>

      {/* Mobil çekmece */}
      {drawer ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menü">
          <button type="button" aria-label="Menüyü kapat" onClick={() => setDrawer(false)} className="absolute inset-0 bg-slate-900/40" />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-xl dark:bg-slate-900">
            <button type="button" onClick={() => setDrawer(false)} className={cn(iconBtn, "absolute right-3 top-4 border-0")} aria-label="Kapat">
              <X className="h-[18px] w-[18px]" />
            </button>
            <Sidebar unseen={unseen} backup={backup} onNavigate={() => setDrawer(false)} />
          </div>
        </div>
      ) : null}
    </>
  );
}
