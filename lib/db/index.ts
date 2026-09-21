// SQLite bağlantısı — tek süreç, tek bağlantı. Dev'de HMR her modülü yeniden
// yüklediği için bağlantı globalThis'te tutulur, yoksa dosya kilitleri birikir.
import "server-only";
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { MIGRATIONS } from "./schema";

export const DATA_DIR = path.resolve(
  process.env.DATA_DIR || path.join(process.cwd(), "data")
);
export const DB_PATH = path.join(DATA_DIR, "crm.db");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
export const BACKUP_DIR = path.join(DATA_DIR, "backups");

function open() {
  for (const d of [DATA_DIR, UPLOAD_DIR, BACKUP_DIR])
    fs.mkdirSync(d, { recursive: true });

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.pragma("busy_timeout = 5000");
  // SQLite'ın lower()/LIKE'ı yalnız ASCII katlar; "İstanbul" ~ "istanbul" için.
  db.function("tr_lower", { deterministic: true }, (s: unknown) =>
    s == null ? null : String(s).toLocaleLowerCase("tr")
  );

  const current = db.pragma("user_version", { simple: true }) as number;
  for (let v = current; v < MIGRATIONS.length; v++) {
    db.transaction(() => {
      db.exec(MIGRATIONS[v]);
      db.pragma(`user_version = ${v + 1}`);
    })();
  }
  return db;
}

const g = globalThis as unknown as { __crmDb?: Database.Database };

export function db() {
  if (!g.__crmDb) g.__crmDb = open();
  return g.__crmDb;
}

export const newId = () => randomUUID();
export const now = () => new Date().toISOString();

// JSON kolon yardımcıları
export function parseList<T = string>(v: unknown): T[] {
  if (typeof v !== "string" || !v) return [];
  try {
    const x = JSON.parse(v);
    return Array.isArray(x) ? x : [];
  } catch {
    return [];
  }
}
export const toJson = (v: unknown[]) => JSON.stringify(v ?? []);

/** Kullanıcı aramasını `tr_lower(col) LIKE ? ESCAPE '\'` için hazırlar. */
export function likePattern(q: string) {
  const s = q.toLocaleLowerCase("tr").replace(/[\\%_]/g, (c) => `\\${c}`);
  return `%${s}%`;
}
