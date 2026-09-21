import type { ReactNode } from "react";

export default function PageHeader({
  eyebrow,
  title,
  count,
  unit,
  action,
}: {
  eyebrow: string;
  title: string;
  count?: number;
  unit?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{eyebrow}</p>
        <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          {title}
        </h1>
        {count != null ? (
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {count} {unit}
          </p>
        ) : null}
      </div>
      {action ? <div>{action}</div> : null}
    </header>
  );
}
