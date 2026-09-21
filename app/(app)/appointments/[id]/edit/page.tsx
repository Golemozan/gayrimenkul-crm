import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import EditAppointmentForm from "@/components/EditAppointmentForm";
import { getAppointment } from "@/lib/db/appointments";
import { clientOptions } from "@/lib/db/clients";
import { propertyOptions } from "@/lib/db/properties";

export const dynamic = "force-dynamic";

export default function EditAppointmentPage({ params }: { params: { id: string } }) {
  const appointment = getAppointment(params.id);
  if (!appointment) notFound();

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Takvim" title="Randevuyu Düzenle" />
      <Link href="/appointments" className="inline-block text-sm font-medium text-brand hover:underline dark:text-brand-light">
        ← Randevulara dön
      </Link>
      <EditAppointmentForm
        appointment={appointment}
        clients={clientOptions().map((c) => ({ value: c.id, label: c.full_name }))}
        properties={propertyOptions().map((p) => ({ value: p.id, label: p.title }))}
      />
    </div>
  );
}
