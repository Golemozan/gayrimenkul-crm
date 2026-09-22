"use server";

import { run } from "@/lib/action";
import { db } from "@/lib/db";
import { DEMO } from "@/lib/demo";
import { resetDemoData } from "@/lib/demo/seed";

export async function resetDemo() {
  return run(() => {
    if (!DEMO) throw new Error("Yalnızca demo modunda kullanılabilir");
    return resetDemoData(db());
  });
}
