import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes, scrypt as _scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { db, newId, now } from "@/lib/db";
import { SESSION_COOKIE, SESSION_DAYS, signSession, verifySession } from "@/lib/session";
import { DEMO, DEMO_USER } from "@/lib/demo";

const scrypt = promisify(_scrypt) as (
  pw: string,
  salt: Buffer,
  len: number
) => Promise<Buffer>;

export type User = { id: string; username: string };

// ---- parola ---------------------------------------------------------------

export async function hashPassword(pw: string) {
  const salt = randomBytes(16);
  const hash = await scrypt(pw, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

async function checkPassword(pw: string, stored: string) {
  const [alg, saltHex, hashHex] = stored.split("$");
  if (alg !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const got = await scrypt(pw, Buffer.from(saltHex, "hex"), expected.length);
  return timingSafeEqual(expected, got);
}

// ---- kullanıcılar -----------------------------------------------------------

export function hasUsers() {
  return !!db().prepare(`SELECT 1 FROM users LIMIT 1`).get();
}

export async function createUser(username: string, password: string) {
  const id = newId();
  db()
    .prepare(`INSERT INTO users (id, username, password_hash, created_at) VALUES (?, ?, ?, ?)`)
    .run(id, username, await hashPassword(password), now());
  return id;
}

export async function verifyLogin(username: string, password: string) {
  if (DEMO) return null;
  const u = db()
    .prepare(`SELECT id, username, password_hash FROM users WHERE username = ?`)
    .get(username) as (User & { password_hash: string }) | undefined;
  // Kullanıcı yoksa da hash hesapla: yanıt süresinden kullanıcı adı sızmasın.
  const ok = await checkPassword(
    password,
    u?.password_hash ?? "scrypt$00$" + "0".repeat(128)
  );
  return u && ok ? { id: u.id, username: u.username } : null;
}

export async function changePassword(uid: string, current: string, next: string) {
  if (DEMO) return false;
  const u = db()
    .prepare(`SELECT password_hash FROM users WHERE id = ?`)
    .get(uid) as { password_hash: string } | undefined;
  if (!u || !(await checkPassword(current, u.password_hash))) return false;
  db()
    .prepare(`UPDATE users SET password_hash = ? WHERE id = ?`)
    .run(await hashPassword(next), uid);
  return true;
}

// ---- oturum -----------------------------------------------------------------

export async function startSession(uid: string) {
  cookies().set(SESSION_COOKIE, await signSession(uid), {
    httpOnly: true,
    sameSite: "lax",
    // Yalnız gerçekten HTTPS ise: ofis ağında http://192.168.x.x ile açılırsa
    // Secure cookie tarayıcıca reddedilir ve giriş döngüye girer.
    secure: headers().get("x-forwarded-proto") === "https",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
  });
}

export function endSession() {
  cookies().delete(SESSION_COOKIE);
}

export async function currentUser(): Promise<User | null> {
  // Demo vitrini: giriş yok, herkes aynı demo kullanıcısı (DB açılışında oluşturulur).
  if (DEMO) {
    db();
    return { ...DEMO_USER };
  }
  const p = await verifySession(cookies().get(SESSION_COOKIE)?.value);
  if (!p) return null;
  const u = db().prepare(`SELECT id, username FROM users WHERE id = ?`).get(p.uid) as
    | User
    | undefined;
  return u ?? null;
}

/** Sayfalarda: oturum yoksa /login'e yollar. */
export async function requireUser() {
  const u = await currentUser();
  if (!u) redirect("/login");
  return u;
}

/** Server action / route handler'da: oturum yoksa hata fırlatır. */
export async function assertUser() {
  const u = await currentUser();
  if (!u) throw new Error("Oturum geçersiz. Lütfen tekrar giriş yapın.");
  return u;
}

// ---- basit giriş denemesi sınırı (süreç belleğinde) ---------------------------

const attempts = new Map<string, { n: number; until: number }>();
const WINDOW = 15 * 60 * 1000;
const MAX = 8;

export function loginBlocked(key: string) {
  const a = attempts.get(key);
  return !!a && a.n >= MAX && a.until > Date.now();
}

export function recordLoginFailure(key: string) {
  const a = attempts.get(key);
  if (!a || a.until < Date.now()) attempts.set(key, { n: 1, until: Date.now() + WINDOW });
  else a.n++;
}

export function clearLoginFailures(key: string) {
  attempts.delete(key);
}
