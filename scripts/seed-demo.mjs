// npm run seed — boş veritabanına gösterim/test verisi basar.
// Gerçek müşteri verisinin üstüne yazmamak için DB boş değilse durur.
// Şema ve eşleştirme motoru uygulamanın kendi dosyalarından gelir (Node 24
// TypeScript'i doğrudan çalıştırır), mantık ikiye bölünmez.
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { MIGRATIONS } from "../lib/db/schema.ts";
import { evaluate } from "../lib/matching.ts";

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

const now = () => new Date().toISOString();
const daysAgo = (d) => new Date(Date.now() - d * 864e5).toISOString();
const J = JSON.stringify;

const properties = [
  ["Moda'da deniz manzaralı 3+1", "satılık", "daire", 9_400_000, "3+1", 135, "Kadıköy", "Moda Mh.", ["asansör", "balkon", "doğalgaz"]],
  ["Göztepe site içi 3+1, otoparklı", "satılık", "daire", 8_200_000, "3+1", 128, "Kadıköy", "Göztepe Mh.", ["asansör", "otopark", "site içi", "doğalgaz", "güvenlik"]],
  ["Acıbadem 2+1 yeni bina", "satılık", "daire", 6_750_000, "2+1", 95, "Üsküdar", "Acıbadem Mh.", ["asansör", "otopark", "krediye uygun"]],
  ["Ataşehir rezidans 1+1", "kiralık", "daire", 42_000, "1+1", 70, "Ataşehir", "Barbaros Mh.", ["asansör", "otopark", "havuz", "güvenlik", "eşyalı"]],
  ["Beşiktaş Abbasağa 2+1", "kiralık", "daire", 55_000, "2+1", 90, "Beşiktaş", "Abbasağa Mh.", ["balkon", "doğalgaz"]],
  ["Çekmeköy bahçeli villa", "satılık", "villa", 21_500_000, "5+1", 320, "Çekmeköy", "Taşdelen Mh.", ["bahçe", "otopark", "havuz", "site içi"]],
  ["Kartal sahil 3+1", "satılık", "daire", 7_300_000, "3+1", 140, "Kartal", "Kordonboyu Mh.", ["asansör", "balkon", "otopark"]],
  ["Şile imarlı arsa", "satılık", "arsa", 3_900_000, null, 600, "Şile", "Ağva", []],
].map(([title, type, property_type, price, rooms, area_m2, district, location, features], i) => ({
  id: randomUUID(), title, type, property_type, price, currency: "TRY", rooms, area_m2,
  city: "İstanbul", district, location, features, images: [], status: "aktif",
  owner_name: null, owner_phone: null, created_at: daysAgo([44, 38, 29, 24, 17, 11, 6, 3][i]),
}));

const clients = [
  ["Ayşe Kaya", "0532 111 22 33", "görüştü"],
  ["Mehmet Demir", "0533 222 33 44", "yeni"],
  ["Zeynep Arslan", "0542 333 44 55", "ilgili"],
  ["Can Yılmaz", "0505 444 55 66", "teklif"],
  ["Elif Şahin", "0555 555 66 77", "yeni"],
].map(([full_name, phone, stage], i) => ({ id: randomUUID(), full_name, phone, stage, created_at: daysAgo([40, 33, 21, 14, 8][i]) }));

const demand = (client, o) => ({
  id: randomUUID(), client_id: client.id, status: "aktif", currency: "TRY",
  property_types: [], city: null, districts: [], budget_min: null, budget_max: null,
  rooms_min: null, area_min: null, area_max: null, features: [], notes: null,
  created_at: client.created_at, ...o,
});

const demands = [
  demand(clients[0], { type: "satılık", property_types: ["daire"], city: "İstanbul", districts: ["Kadıköy", "Üsküdar"], budget_max: 10_000_000, rooms_min: 3, area_min: 110, features: ["otopark", "asansör"] }),
  demand(clients[1], { type: "kiralık", city: "İstanbul", districts: ["Ataşehir", "Kadıköy"], budget_max: 45_000, features: ["eşyalı"] }),
  demand(clients[2], { type: "satılık", property_types: ["daire"], city: "İstanbul", budget_min: 5_000_000, budget_max: 7_000_000, rooms_min: 2, features: ["krediye uygun"] }),
  demand(clients[3], { type: "satılık", property_types: ["villa"], city: "İstanbul", budget_max: 20_000_000, features: ["bahçe", "havuz"] }),
  demand(clients[4], { type: "kiralık", city: "İstanbul", districts: ["Beşiktaş", "Şişli"], budget_max: 60_000, rooms_min: 2 }),
];

db.transaction(() => {
  const ip = db.prepare(`INSERT INTO properties (id,title,type,property_type,price,currency,rooms,area_m2,location,district,city,images,features,status,created_at)
    VALUES (@id,@title,@type,@property_type,@price,@currency,@rooms,@area_m2,@location,@district,@city,@images,@features,@status,@created_at)`);
  for (const p of properties) ip.run({ ...p, images: J(p.images), features: J(p.features) });

  const ic = db.prepare(`INSERT INTO clients (id,full_name,phone,stage,created_at) VALUES (@id,@full_name,@phone,@stage,@created_at)`);
  for (const c of clients) ic.run(c);

  const id = db.prepare(`INSERT INTO demands (id,client_id,type,property_types,city,districts,budget_min,budget_max,currency,rooms_min,area_min,area_max,features,status,notes,created_at)
    VALUES (@id,@client_id,@type,@property_types,@city,@districts,@budget_min,@budget_max,@currency,@rooms_min,@area_min,@area_max,@features,@status,@notes,@created_at)`);
  for (const d of demands)
    id.run({ ...d, property_types: J(d.property_types), districts: J(d.districts), features: J(d.features) });

  const im = db.prepare(`INSERT INTO matches (id,demand_id,property_id,score,reasons,misses,"trigger",status,created_at,updated_at)
    VALUES (?,?,?,?,?,?,'ilan','yeni',?,?)`);
  let n = 0;
  for (const d of demands)
    for (const p of properties) {
      const r = evaluate({ property: p, demand: d });
      // Eşleşme, ilan ile talepten hangisi sonra girildiyse o an oluşmuştur.
      const at = p.created_at > d.created_at ? p.created_at : d.created_at;
      if (r.match) (im.run(randomUUID(), d.id, p.id, r.score, J(r.reasons), J(r.misses), at, at), n++);
    }

  const ia = db.prepare(`INSERT INTO activities (id,client_id,property_id,kind,body,occurred_at,created_at) VALUES (?,?,?,?,?,?,?)`);
  ia.run(randomUUID(), clients[0].id, null, "arama", "İlk görüşme: Kadıköy/Üsküdar'da otoparklı 3+1 arıyor, eşiyle birlikte karar verecekler.", daysAgo(6), now());
  ia.run(randomUUID(), clients[0].id, properties[1].id, "yer gösterme", "Göztepe'deki daireyi gezdik, mutfağı küçük buldu.", daysAgo(3), now());
  ia.run(randomUUID(), clients[3].id, properties[5].id, "görüşme", "Villa için 20M teklif vermeyi düşünüyor.", daysAgo(1), now());
  ia.run(randomUUID(), clients[2].id, null, "arama", "Kredi ön onayı çıktı, 7M'ye kadar bakabiliyor.", daysAgo(9), now());
  ia.run(randomUUID(), clients[2].id, properties[2].id, "yer gösterme", "Acıbadem'deki daireyi gezdi, cephe konusunda kararsız.", daysAgo(7), now());
  ia.run(randomUUID(), clients[1].id, properties[3].id, "mesaj", "Ataşehir rezidans ilanı WhatsApp'tan iletildi.", daysAgo(5), now());
  ia.run(randomUUID(), clients[4].id, null, "arama", "Beşiktaş'ta 2+1 kiralık arıyor, evcil hayvanı var.", daysAgo(2), now());

  const today = new Date();
  const d = (k) => new Date(today.getTime() + k * 864e5).toISOString().slice(0, 10);
  const iap = db.prepare(`INSERT INTO appointments (id,client_id,property_id,date,time,notes,status,created_at) VALUES (?,?,?,?,?,?,?,?)`);
  iap.run(randomUUID(), clients[0].id, properties[0].id, d(1), "14:00", "Moda'daki daire gösterimi", "bekliyor", now());
  iap.run(randomUUID(), clients[3].id, properties[5].id, d(3), "11:00", "Villa ikinci gösterim", "bekliyor", now());

  console.log(`Demo verisi basıldı: ${properties.length} ilan, ${clients.length} müşteri, ${demands.length} talep, ${n} eşleşme.`);
})();
