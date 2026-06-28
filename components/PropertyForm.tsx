"use client";

import { useState } from "react";
import PropertyFormCore from "@/components/PropertyFormCore";

export default function PropertyForm() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
      >
        + İlan Ekle
      </button>
    );
  }

  return (
    <div className="w-full">
      <PropertyFormCore
        mode="create"
        onDone={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      />
    </div>
  );
}
