"use client";

import { useEffect, useRef } from "react";
import { markMatchesSeen } from "@/app/actions/matches";

/**
 * Eşleşmeler sayfası açılınca zil sıfırlanır. "Görüldü" ≠ "işlendi": kart,
 * emlakçı bir aksiyon alana kadar "Bekleyen" sekmesinde kalır.
 */
export default function MarkSeenOnView({ unseen }: { unseen: number }) {
  const done = useRef(false);
  useEffect(() => {
    if (unseen > 0 && !done.current) {
      done.current = true;
      void markMatchesSeen();
    }
  }, [unseen]);
  return null;
}
