import Sidebar from "@/components/shell/Sidebar";
import Topbar from "@/components/shell/Topbar";
import { requireUser } from "@/lib/auth";
import { ensureDailyBackup, listBackups } from "@/lib/backup";
import { unseenCount } from "@/lib/db/matches";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  await ensureDailyBackup();

  const unseen = unseenCount();
  const backups = listBackups();
  const backup = { lastAt: backups[0]?.mtime ?? null, count: backups.length };

  return (
    <div className="lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 bg-white lg:block dark:border-slate-800 dark:bg-slate-900">
        <Sidebar unseen={unseen} backup={backup} />
      </aside>
      <Topbar username={user.username} unseen={unseen} backup={backup} />
      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:py-8">{children}</main>
    </div>
  );
}
