// Oturum token'ı: base64url(payload).base64url(HMAC-SHA256). Yalnız Web Crypto
// kullanır — hem Edge middleware'de hem Node'da aynı kod çalışır.

export const SESSION_COOKIE = "crm_session";
export const SESSION_DAYS = 30;

type Payload = { uid: string; exp: number };

const enc = new TextEncoder();

function b64url(bytes: Uint8Array) {
  let s = "";
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string) {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32)
    throw new Error(
      "SESSION_SECRET eksik. `npm run dev` / `npm start` ilk çalıştırmada .env.local'a yazar."
    );
  return s;
}

async function key() {
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signSession(uid: string) {
  const payload: Payload = { uid, exp: Date.now() + SESSION_DAYS * 864e5 };
  const body = b64url(enc.encode(JSON.stringify(payload)));
  const sig = new Uint8Array(
    await crypto.subtle.sign("HMAC", await key(), enc.encode(body))
  );
  return `${body}.${b64url(sig)}`;
}

export async function verifySession(token: string | undefined | null) {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  try {
    const ok = await crypto.subtle.verify(
      "HMAC",
      await key(),
      fromB64url(sig),
      enc.encode(body)
    );
    if (!ok) return null;
    const p = JSON.parse(new TextDecoder().decode(fromB64url(body))) as Payload;
    if (typeof p.uid !== "string" || typeof p.exp !== "number") return null;
    if (p.exp < Date.now()) return null;
    return p;
  } catch {
    return null;
  }
}
