"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import { resetDemo } from "@/app/actions/demo";

/** Canlı demoda her sayfanın üstünde: ne olduğunu ve verinin geçici olduğunu söyler. */
export default function DemoBanner() {
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-slate-900 px-4 py-2 text-center text-xs text-slate-200 dark:bg-slate-800">
      <span>
        <b className="font-semibold text-white">Canlı demo.</b> Örnek veriyle çalışır; eklediğiniz kayıtlar geçicidir ve
        zaman zaman sıfırlanır. Şifre, WhatsApp ve fotoğraf yükleme demoda kapalı.
      </span>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await resetDemo();
            if (res.ok) toast.success("Demo verisi baştan yüklendi");
            else toast.error(res.error);
          })
        }
        className="inline-flex min-h-7 items-center gap-1 rounded-full bg-white/10 px-3 font-medium text-white transition hover:bg-white/20 disabled:opacity-50"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        {pending ? "Sıfırlanıyor…" : "Demoyu sıfırla"}
      </button>
    </div>
  );
}
