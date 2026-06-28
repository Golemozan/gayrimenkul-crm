"use client";

import { useRouter } from "next/navigation";
import AppointmentFormCore from "@/components/AppointmentFormCore";
import type { Appointment } from "@/types";

type Option = { value: string; label: string };

export default function EditAppointmentForm({
  appointment,
  clients,
  properties,
}: {
  appointment: Appointment;
  clients: Option[];
  properties: Option[];
}) {
  const router = useRouter();
  return (
    <AppointmentFormCore
      mode="edit"
      initial={appointment}
      clients={clients}
      properties={properties}
      onCancel={() => router.push("/appointments")}
    />
  );
}
