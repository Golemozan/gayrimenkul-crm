import { TZ } from "@/lib/constants";
import { Database, Download } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import AuthForm from "@/components/AuthForm";
import ExportButton from "@/components/ExportButton";
import { Card, EmptyState } from "@/components/primitives";
import { changePasswordAction } from "@/app/actions/auth";
import { requireUser } from "@/lib/auth";
import { listBackups } from "@/lib/backup";
import { DATA_DIR } from "@/lib/db";
import { DEMO } from "@/lib/demo";

export const dynamic = "force-dynamic";

const fmt = new Intl.DateTimeFormat("tr-TR", { timeZone: TZ, dateStyle: "medium", timeStyle: "short" });
const kb = (n: number) => `${Math.max(1, Math.round(n / 1024))} KB`;

export default async function SettingsPage() {
  const user = await requireUser();
  const backups = listBackups();

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Hesap" title="Ayarlar" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card
          title="Yedekleme"
          action={
            <a
              href="/api/backup"
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-brand px-3.5 text-sm font-medium text-white shadow-sm hover:bg-brand-dark"
            >
              <Download className="h-4 w-4" />
              Şimdi yedek indir
            </a>
          }
        >
          <p className="px-5 pt-4 text-sm text-slate-500 dark:text-slate-400">
            Her gün ilk açılışta otomatik yedek alınır, son 14 gün saklanır. İndirdiğiniz
            <code className="mx-1 rounded bg-slate-100 px-1 text-xs dark:bg-slate-800">.db</code>
            dosyası tüm verinin tam kopyasıdır; USB veya buluta koyun.
          </p>
          <p className="px-5 pt-2 text-xs text-slate-400">
            Veri klasörü: <code className="break-all">{DATA_DIR}</code>
          </p>
          {backups.length ? (
            <ul className="mt-3 divide-y divide-slate-100 border-t border-slate-100 dark:divide-slate-800 dark:border-slate-800">
              {backups.map((b) => (
                <li key={b.name} className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm">
                  <span className="tabular-nums text-slate-700 dark:text-slate-200">
                    {fmt.format(new Date(b.mtime))}
                    <span className="ml-2 text-xs text-slate-400">{kb(b.size)}</span>
                  </span>
                  <a href={`/api/backup?name=${encodeURIComponent(b.name)}`} className="inline-flex min-h-9 items-center text-sm font-medium text-brand hover:underline dark:text-brand-light">
                    İndir
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={<Database className="h-5 w-5" />} title="Henüz günlük yedek yok" />
          )}
        </Card>

        <div className="space-y-6">
          {DEMO ? (
            <Card title="Şifre değiştir">
              <p className="p-5 text-sm text-slate-500 dark:text-slate-400">Demoda giriş ve şifre yok. Gerçek kurulumda ilk açılışta yönetici hesabı oluşturulur.</p>
            </Card>
          ) : (
          <Card title="Şifre değiştir">
            <div className="p-5">
              <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                Oturum: <span className="font-medium text-slate-700 dark:text-slate-200">{user.username}</span>
              </p>
              <AuthForm
                action={changePasswordAction}
                submitLabel="Şifreyi güncelle"
                autoFocus={false}
                fields={[
                  { name: "current", label: "Mevcut şifre", type: "password", autoComplete: "current-password" },
                  { name: "next_password", label: "Yeni şifre (en az 8 karakter)", type: "password", autoComplete: "new-password" },
                  { name: "next_password2", label: "Yeni şifre (tekrar)", type: "password", autoComplete: "new-password" },
                ]}
              />
            </div>
          </Card>
          )}

          <Card title="Excel'e aktar">
            <div className="flex flex-wrap gap-2 p-5">
              <ExportButton table="properties" filename="ilanlar" label="İlanlar" />
              <ExportButton table="clients" filename="musteriler" label="Müşteriler" />
              <ExportButton table="demands" filename="talepler" label="Talepler" />
              <ExportButton table="appointments" filename="randevular" label="Randevular" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
