"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { exportRows, type ExportTable } from "@/app/actions/export";
import { Button } from "@/components/primitives";

export default function ExportButton({
  table,
  filename,
  label = "Excel'e Aktar",
}: {
  table: ExportTable;
  filename: string;
  label?: string;
}) {
  const [pending, start] = useTransition();

  function onExport() {
    start(async () => {
      try {
        const rows = await exportRows(table);
        if (rows.length === 0) {
          toast.info("Aktarılacak kayıt yok.");
          return;
        }
        // xlsx ağır: yalnızca tıklanınca yükle.
        const XLSX = await import("xlsx");
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Veri");
        XLSX.writeFile(wb, `${filename}.xlsx`);
      } catch (e) {
        toast.error(`Dışa aktarılamadı: ${(e as Error).message}`);
      }
    });
  }

  return (
    <Button variant="secondary" onClick={onExport} disabled={pending}>
      <Download className="h-4 w-4" />
      {pending ? "Hazırlanıyor…" : label}
    </Button>
  );
}
