import { toast } from "sonner";

/** Kayıt sonrası eşleşme bildirimi: motorun ne bulduğunu emlakçıya hemen söyler. */
export function notifyMatches(n: number, subject: "ilan" | "talep") {
  if (n <= 0) return;
  toast.success(
    subject === "ilan"
      ? `Bu ilan ${n} müşteri talebine uyuyor`
      : `Bu talebe uyan ${n} ilan bulundu`,
    { action: { label: "Eşleşmeler", onClick: () => (window.location.href = "/matches") } }
  );
}
