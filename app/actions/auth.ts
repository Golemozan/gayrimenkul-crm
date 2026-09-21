"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  assertUser,
  changePassword,
  clearLoginFailures,
  createUser,
  endSession,
  hasUsers,
  loginBlocked,
  recordLoginFailure,
  startSession,
  verifyLogin,
} from "@/lib/auth";
import { credentialsSchema } from "@/lib/schemas";

export type FormState = { error?: string; ok?: string } | undefined;

const safeNext = (v: FormDataEntryValue | null) => {
  const s = typeof v === "string" ? v : "";
  // Açık yönlendirme engeli: yalnız site içi yol.
  return s.startsWith("/") && !s.startsWith("//") ? s : "/";
};

export async function setupAction(_: FormState, fd: FormData): Promise<FormState> {
  if (hasUsers()) redirect("/login");
  const parsed = credentialsSchema.safeParse({
    username: fd.get("username"),
    password: fd.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (fd.get("password") !== fd.get("password2")) return { error: "Şifreler eşleşmiyor" };

  const id = await createUser(parsed.data.username, parsed.data.password);
  await startSession(id);
  redirect("/");
}

export async function loginAction(_: FormState, fd: FormData): Promise<FormState> {
  const ip = headers().get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const username = String(fd.get("username") ?? "").trim();
  const key = `${ip}|${username.toLowerCase()}`;
  if (loginBlocked(key))
    return { error: "Çok fazla hatalı deneme. 15 dakika sonra tekrar deneyin." };

  const u = await verifyLogin(username, String(fd.get("password") ?? ""));
  if (!u) {
    recordLoginFailure(key);
    return { error: "Kullanıcı adı veya şifre hatalı" };
  }
  clearLoginFailures(key);
  await startSession(u.id);
  redirect(safeNext(fd.get("next")));
}

export async function logoutAction() {
  endSession();
  redirect("/login");
}

export async function changePasswordAction(_: FormState, fd: FormData): Promise<FormState> {
  const u = await assertUser();
  const next = String(fd.get("next_password") ?? "");
  if (next.length < 8) return { error: "Yeni şifre en az 8 karakter" };
  if (next !== fd.get("next_password2")) return { error: "Yeni şifreler eşleşmiyor" };
  const ok = await changePassword(u.id, String(fd.get("current") ?? ""), next);
  return ok ? { ok: "Şifre güncellendi" } : { error: "Mevcut şifre hatalı" };
}
