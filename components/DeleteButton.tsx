"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteProperty } from "@/app/actions/properties";
import { deleteClient } from "@/app/actions/clients";
import { deleteAppointment } from "@/app/actions/appointments";
import { deleteDemand } from "@/app/actions/demands";
import { deleteActivity } from "@/app/actions/activities";
import { cn } from "@/lib/utils";

const actions = {
  property: deleteProperty,
  client: deleteClient,
  appointment: deleteAppointment,
  demand: deleteDemand,
  activity: deleteActivity,
};

export default function DeleteButton({
  kind,
  id,
  confirmText = "Bu kaydı silmek istediğinize emin misiniz?",
  label = "Sil",
  redirectTo,
  className,
}: {
  kind: keyof typeof actions;
  id: string;
  confirmText?: string;
  label?: string;
  redirectTo?: string;
  className?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function onDelete() {
    if (!window.confirm(confirmText)) return;
    start(async () => {
      const res = await actions[kind](id);
      if (!res.ok) {
        toast.error(`Silinemedi: ${res.error}`);
        return;
      }
      toast.success("Silindi");
      if (redirectTo) router.push(redirectTo);
    });
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={pending}
      className={cn(
        "inline-flex min-h-9 items-center text-sm font-medium text-rose-600 hover:underline disabled:opacity-50 dark:text-rose-400",
        className
      )}
    >
      {pending ? "Siliniyor…" : label}
    </button>
  );
}
