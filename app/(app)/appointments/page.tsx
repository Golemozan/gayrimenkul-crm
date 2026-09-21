import Link from "next/link";
import AppointmentForm from "@/components/AppointmentForm";
import DeleteButton from "@/components/DeleteButton";
import ExportButton from "@/components/ExportButton";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { listAppointments } from "@/lib/db/appointments";
import { clientOptions } from "@/lib/db/clients";
import { propertyOptions } from "@/lib/db/properties";

export const dynamic = "force-dynamic";

const fmtDay = new Intl.DateTimeFormat("tr-TR", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

export default function AppointmentsPage() {
  const appointments = listAppointments();
  const clients = clientOptions();
  const properties = propertyOptions();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Takvim"
        title="Randevular"
        count={appointments.length}
        unit="randevu"
        action={<ExportButton table="appointments" filename="randevular" />}
      />

      <AppointmentForm
        clients={clients.map((c) => ({ value: c.id, label: c.full_name }))}
        properties={properties.map((p) => ({ value: p.id, label: p.title }))}
      />

      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Tarih</th>
              <th className="px-4 py-3 font-medium">Saat</th>
              <th className="px-4 py-3 font-medium">Müşteri</th>
              <th className="px-4 py-3 font-medium">İlan</th>
              <th className="px-4 py-3 font-medium">Not</th>
              <th className="px-4 py-3 font-medium">Durum</th>
              <th className="px-4 py-3 font-medium">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {appointments.map((a) => {
              const overdue = a.status === "bekliyor" && a.date < today;
              return (
                <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-medium tabular-nums text-slate-900 dark:text-slate-100">
                    {fmtDay.format(new Date(`${a.date}T00:00`))}
                    {overdue ? <span className="ml-2 text-xs font-normal text-rose-600 dark:text-rose-400">geçti</span> : null}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-slate-600 dark:text-slate-300">{a.time ? a.time.slice(0, 5) : "—"}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {a.client_id && a.client_name ? (
                      <Link href={`/clients/${a.client_id}`} className="hover:text-brand">{a.client_name}</Link>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {a.property_id && a.property_title ? (
                      <Link href={`/properties/${a.property_id}`} className="hover:text-brand">{a.property_title}</Link>
                    ) : "—"}
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-slate-500 dark:text-slate-400">{a.notes ?? "—"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge value={a.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link href={`/appointments/${a.id}/edit`} className="inline-flex min-h-9 items-center text-sm font-medium text-brand hover:underline dark:text-brand-light">
                        Düzenle
                      </Link>
                      <DeleteButton kind="appointment" id={a.id} confirmText="Bu randevuyu silmek istediğinize emin misiniz?" />
                    </div>
                  </td>
                </tr>
              );
            })}
            {appointments.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-400 dark:text-slate-500">
                  Henüz randevu yok. Üstten ekleyin.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
