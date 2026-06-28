import Link from "next/link";
import AppointmentForm from "@/components/AppointmentForm";
import DeleteButton from "@/components/DeleteButton";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { createClient } from "@/lib/supabase/server";
import type { Appointment, Client, Property } from "@/types";

export const dynamic = "force-dynamic";

export default async function AppointmentsPage() {
  const supabase = createClient();

  const [apptRes, clientRes, propRes] = await Promise.all([
    supabase
      .from("appointments")
      .select("*")
      .order("date", { ascending: true }),
    supabase.from("clients").select("id, full_name"),
    supabase.from("properties").select("id, title"),
  ]);

  const appointments = (apptRes.data ?? []) as Appointment[];
  const clients = (clientRes.data ?? []) as Pick<Client, "id" | "full_name">[];
  const properties = (propRes.data ?? []) as Pick<Property, "id" | "title">[];

  const clientName = new Map(clients.map((c) => [c.id, c.full_name]));
  const propTitle = new Map(properties.map((p) => [p.id, p.title]));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Takvim"
        title="Randevular"
        count={appointments.length}
        unit="randevu"
      />

      <AppointmentForm
        clients={clients.map((c) => ({ value: c.id, label: c.full_name }))}
        properties={properties.map((p) => ({ value: p.id, label: p.title }))}
      />

      {apptRes.error ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          Veri çekilemedi: {apptRes.error.message}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
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
            {appointments.map((a) => (
              <tr
                key={a.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
              >
                <td className="px-4 py-3 font-medium tabular-nums text-slate-900 dark:text-slate-100">
                  {a.date}
                </td>
                <td className="px-4 py-3 tabular-nums text-slate-600 dark:text-slate-300">
                  {a.time ? a.time.slice(0, 5) : "—"}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  {a.client_id ? clientName.get(a.client_id) ?? "—" : "—"}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  {a.property_id ? propTitle.get(a.property_id) ?? "—" : "—"}
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                  {a.notes ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge value={a.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/appointments/${a.id}/edit`}
                      className="text-sm font-medium text-brand hover:underline dark:text-brand-light"
                    >
                      Düzenle
                    </Link>
                    <DeleteButton
                      table="appointments"
                      id={a.id}
                      confirmText="Bu randevuyu silmek istediğinize emin misiniz?"
                    />
                  </div>
                </td>
              </tr>
            ))}
            {appointments.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-slate-400 dark:text-slate-500"
                >
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
