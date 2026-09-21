import "server-only";
import fs from "node:fs";
import path from "node:path";
import { UPLOAD_DIR, newId } from "@/lib/db";

export const MAX_UPLOAD_MB = 5;
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
export const MIME: Record<string, string> = Object.fromEntries(
  Object.entries(EXT).map(([m, e]) => [e, m])
);

const NAME = /^[0-9a-f-]{36}\.(jpg|png|webp|gif)$/;
const URL_PREFIX = "/api/uploads/";

// İçerik gerçekten görsel mi — tarayıcının bildirdiği MIME'a güvenilmez.
function sniff(b: Buffer) {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
    return "image/png";
  if (b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP")
    return "image/webp";
  if (b.subarray(0, 4).toString("ascii") === "GIF8") return "image/gif";
  return null;
}

export async function saveUpload(file: File) {
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024)
    throw new Error(`Her görsel ${MAX_UPLOAD_MB} MB'tan küçük olmalı.`);
  const buf = Buffer.from(await file.arrayBuffer());
  const mime = sniff(buf);
  if (!mime) throw new Error("Sadece JPG, PNG, WEBP veya GIF yükleyin.");
  const name = `${newId()}.${EXT[mime]}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, name), buf);
  return `${URL_PREFIX}${name}`;
}

export function uploadFile(name: string) {
  return NAME.test(name) ? path.join(UPLOAD_DIR, name) : null;
}

/** İlan silinince / galeriden çıkarılınca diskte artık kalmasın. */
export function removeUploads(urls: string[]) {
  for (const u of urls) {
    if (!u.startsWith(URL_PREFIX)) continue;
    const p = uploadFile(u.slice(URL_PREFIX.length));
    if (p) fs.rmSync(p, { force: true });
  }
}
