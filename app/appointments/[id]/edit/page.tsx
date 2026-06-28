import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import EditAppointmentForm from "@/components/EditAppointmentForm";
import { createClient } from "@/lib/supabase/server";
import type { Appointment, Client, Property } from "@/types";

export const dynamic = "force-dynamic";

export default async function EditAppointmentPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const [apptRes, clientRes, propRes] = await Promise.all([
    supabase.from("appointments").select("*").eq("id", params.id).single(),
    supabase.from("clients").select("id, full_name"),
    supabase.from("properties").select("id, title"),
  ]);

  if (apptRes.error || !apptRes.data) notFound();
  const appointment = apptRes.data as Appointment;
  const clients = (clientRes.data ?? []) as Pick<Client, "id" | "full_name">[];
  const properties = (propRes.data ?? []) as Pick<Property, "id" | "title">[];

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Takvim" title="Randevuyu Düzenle" />
      <Link
        href="/appointments"
        className="inline-block text-sm font-medium text-brand hover:underline dark:text-brand-light"
      >
        ← Randevulara dön
      </Link>
      <EditAppointmentForm
        appointment={appointment}
        clients={clients.map((c) => ({ value: c.id, label: c.full_name }))}
        properties={properties.map((p) => ({ value: p.id, label: p.title }))}
      />
    </div>
  );
}
