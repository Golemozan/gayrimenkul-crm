import Link from "next/link";

// Mevcut filtreleri koruyarak sayfa linkleri üretir.
export default function Pagination({
  basePath,
  params,
  page,
  pageSize,
  total,
}: {
  basePath: string;
  params: Record<string, string | undefined>;
  page: number;
  pageSize: number;
  total: number;
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (pageCount <= 1) return null;

  const hrefFor = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v && k !== "page") sp.set(k, v);
    }
    sp.set("page", String(p));
    return `${basePath}?${sp.toString()}`;
  };

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  // Gösterilecek sayfa numaraları (current ± 2)
  const nums: number[] = [];
  for (let p = Math.max(1, page - 2); p <= Math.min(pageCount, page + 2); p++) {
    nums.push(p);
  }

  const btn =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm font-medium transition";
  const idle =
    "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800";
  const active = "border-brand bg-brand text-white";
  const disabled =
    "pointer-events-none border-slate-100 text-slate-300 dark:border-slate-800 dark:text-slate-700";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {from}–{to} / {total} kayıt
      </p>
      <div className="flex items-center gap-1">
        <Link
          href={hrefFor(page - 1)}
          aria-disabled={page <= 1}
          className={`${btn} ${page <= 1 ? disabled : idle}`}
        >
          ‹
        </Link>
        {nums.map((p) => (
          <Link
            key={p}
            href={hrefFor(p)}
            className={`${btn} ${p === page ? active : idle}`}
          >
            {p}
          </Link>
        ))}
        <Link
          href={hrefFor(page + 1)}
          aria-disabled={page >= pageCount}
          className={`${btn} ${page >= pageCount ? disabled : idle}`}
        >
          ›
        </Link>
      </div>
    </div>
  );
}
