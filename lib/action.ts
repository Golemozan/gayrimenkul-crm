import "server-only";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { assertUser, type User } from "@/lib/auth";

export type Result<T = null> = { ok: true; data: T } | { ok: false; error: string };

/**
 * Tüm yazma action'larının ortak kabuğu: oturum kontrolü, hata → mesaj,
 * başarıda tüm sayfaların verisini tazele (sayfalar zaten force-dynamic).
 */
export async function run<T>(fn: (u: User) => T | Promise<T>): Promise<Result<T>> {
  try {
    const u = await assertUser();
    const data = await fn(u);
    revalidatePath("/", "layout");
    return { ok: true, data };
  } catch (e) {
    if (e instanceof ZodError)
      return { ok: false, error: e.issues.map((i) => i.message).join(" · ") };
    console.error(e);
    return { ok: false, error: (e as Error).message || "Beklenmeyen hata" };
  }
}
