// Paylaşılan primitifler — yeni ekranlar bunları kullanır, sınıf kopyalamaz.
// Tek aksan: brand. Dokunma hedefi: min 36px (h-9).
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-dark shadow-sm",
  secondary:
    "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
  ghost:
    "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100",
  danger:
    "text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10",
};

const base =
  "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg px-3.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:pointer-events-none disabled:opacity-50";

export function Button({
  variant = "primary",
  className,
  ...rest
}: ComponentProps<"button"> & { variant?: Variant }) {
  return <button className={cn(base, variants[variant], className)} {...rest} />;
}

export function LinkButton({
  variant = "primary",
  className,
  ...rest
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={cn(base, variants[variant], className)} {...rest} />;
}

export function Card({
  className,
  children,
  title,
  action,
}: {
  className?: string;
  children: ReactNode;
  title?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900",
        className
      )}
    >
      {title ? (
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">{title}</h2>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function EmptyState({
  icon,
  title,
  children,
  className,
}: {
  icon?: ReactNode;
  title: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-10 text-center", className)}>
      {icon ? (
        <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
          {icon}
        </span>
      ) : null}
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</p>
      {children ? (
        <div className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{children}</div>
      ) : null}
    </div>
  );
}

export function Notice({
  tone = "error",
  children,
  className,
}: {
  tone?: "error" | "warn" | "ok";
  children: ReactNode;
  className?: string;
}) {
  const tones = {
    error:
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
    warn: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
    ok: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  };
  return (
    <p role={tone === "error" ? "alert" : undefined} className={cn("rounded-lg border px-4 py-3 text-sm", tones[tone], className)}>
      {children}
    </p>
  );
}

/** Çoklu seçim için aç/kapa çip. Seçili durum rengi = brand. */
export function ToggleChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-9 items-center rounded-full border px-3 text-sm capitalize transition",
        selected
          ? "border-brand bg-brand/10 font-medium text-brand dark:border-brand-light dark:bg-brand/20 dark:text-brand-light"
          : "border-slate-300 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500"
      )}
    >
      {children}
    </button>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-brass dark:text-brass-light">
      {children}
    </p>
  );
}

/** Eşleşme puanı rozeti: yüksek puan dolu, düşük puan soluk. */
export function ScoreBadge({ score }: { score: number }) {
  const tone =
    score >= 85
      ? "bg-brand text-white"
      : score >= 70
        ? "bg-brand/15 text-brand dark:bg-brand/25 dark:text-brand-light"
        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
  return (
    <span
      title="Eşleşme puanı (0-100)"
      className={cn("inline-flex h-7 min-w-10 items-center justify-center rounded-md px-2 text-xs font-bold tabular-nums", tone)}
    >
      {score}
    </span>
  );
}
