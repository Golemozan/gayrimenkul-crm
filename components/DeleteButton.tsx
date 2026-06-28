"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DeleteButton({
  table,
  id,
  confirmText = "Bu kaydı silmek istediğinize emin misiniz?",
  label = "Sil",
}: {
  table: "properties" | "clients" | "appointments";
  id: string;
  confirmText?: string;
  label?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    if (!window.confirm(confirmText)) return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from(table).delete().eq("id", id);
    setLoading(false);
    if (error) {
      window.alert(`Silinemedi: ${error.message}`);
      return;
    }
    router.refresh();
  }

  return (
    <button
      onClick={onDelete}
      disabled={loading}
      className="text-sm font-medium text-rose-600 hover:underline disabled:opacity-50 dark:text-rose-400"
    >
      {loading ? "Siliniyor…" : label}
    </button>
  );
}
