// npm run seed — boş veritabanına gösterim/test verisi basar.
// Gerçek müşteri verisinin üstüne yazmamak için DB boş değilse durur.
// Veri lib/demo/seed.ts'ten gelir (canlı demo da aynısını kullanır); Node 24
// TypeScript'i doğrudan çalıştırır.
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { MIGRATIONS } from "../lib/db/schema.ts";
import { seedDemo } from "../lib/demo/seed.ts";

const DATA_DIR = path.resolve(process.env.DATA_DIR || "data");
fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new Database(path.join(DATA_DIR, "crm.db"));
db.pragma("foreign_keys = ON");

const v = db.pragma("user_version", { simple: true });
for (let i = v; i < MIGRATIONS.length; i++) {
  db.exec(MIGRATIONS[i]);
  db.pragma(`user_version = ${i + 1}`);
}

const has = db.prepare("SELECT (SELECT COUNT(*) FROM properties) + (SELECT COUNT(*) FROM clients) n").get().n;
if (has > 0) {
  console.error("Veritabanı boş değil, demo verisi basılmadı.");
  process.exit(1);
}

const r = seedDemo(db);
console.log(`Demo verisi basıldı: ${r.properties} ilan, ${r.clients} müşteri, ${r.demands} talep, ${r.matches} eşleşme.`);
