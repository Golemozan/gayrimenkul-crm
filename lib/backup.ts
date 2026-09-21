import "server-only";
import fs from "node:fs";
import path from "node:path";
import { BACKUP_DIR, db } from "@/lib/db";

const KEEP = 14;
const NAME = /^crm-\d{4}-\d{2}-\d{2}\.db$/;

let lastCheck = "";

/** Günün ilk isteğinde tam kopya alır, son KEEP günü tutar. Hata uygulamayı durdurmaz. */
export async function ensureDailyBackup() {
  const day = new Date().toISOString().slice(0, 10);
  if (lastCheck === day) return;
  lastCheck = day;
  const target = path.join(BACKUP_DIR, `crm-${day}.db`);
  try {
    if (!fs.existsSync(target)) await db().backup(target);
    const old = listBackups().slice(KEEP);
    for (const b of old) fs.rmSync(path.join(BACKUP_DIR, b.name), { force: true });
  } catch (e) {
    lastCheck = "";
    console.error("Otomatik yedek alınamadı:", e);
  }
}

export function listBackups() {
  if (!fs.existsSync(BACKUP_DIR)) return [];
  return fs
    .readdirSync(BACKUP_DIR)
    .filter((n) => NAME.test(n))
    .map((name) => {
      const st = fs.statSync(path.join(BACKUP_DIR, name));
      return { name, size: st.size, mtime: st.mtime.toISOString() };
    })
    .sort((a, b) => b.name.localeCompare(a.name));
}

export function backupPath(name: string) {
  return NAME.test(name) ? path.join(BACKUP_DIR, name) : null;
}

/** Anlık yedek: geçici dosyaya alır, yolunu döner (çağıran siler). */
export async function snapshot() {
  const tmp = path.join(BACKUP_DIR, `.snapshot-${Date.now()}.db`);
  await db().backup(tmp);
  return tmp;
}
