"use client";

import { useState } from "react";
import AppointmentFormCore from "@/components/AppointmentFormCore";

type Option = { value: string; label: string };

export default function AppointmentForm({
  clients,
  properties,
}: {
  clients: Option[];
  properties: Option[];
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
      >
        + Randevu Ekle
      </button>
    );
  }

  return (
    <div className="w-full">
      <AppointmentFormCore
        mode="create"
        clients={clients}
        properties={properties}
        onDone={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      />
    </div>
  );
}
