// Demo verisi — hem `npm run seed` hem canlı demo modu bunu kullanır.
// Uygulamanın kendi eşleştirme motorundan geçer; eşleşmeler elle yazılmaz.
// Tarihler "şimdi"ye göredir: veri her zaman son ~45 güne yayılır.
// Telefonlar 0500 ile başlar (Türkiye'de atanmamış önek) — gerçek kişiye denk gelmez.
import { randomUUID } from "node:crypto";
import type Database from "better-sqlite3";
import { evaluate } from "../matching.ts";
import type { Demand, Property } from "../../types/index.ts";

const now = () => new Date().toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 864e5).toISOString();
const J = JSON.stringify;

type P = Property;
type D = Omit<Demand, "notes"> & { notes: string | null };

export function seedDemo(db: Database.Database) {
  const properties: P[] = (
    [
      ["Moda'da deniz manzaralı 3+1", "satılık", "daire", 9_400_000, "3+1", 135, "Kadıköy", "Moda Mh.", ["asansör", "balkon", "doğalgaz"]],
      ["Göztepe site içi 3+1, otoparklı", "satılık", "daire", 8_200_000, "3+1", 128, "Kadıköy", "Göztepe Mh.", ["asansör", "otopark", "site içi", "doğalgaz", "güvenlik"]],
      ["Acıbadem 2+1 yeni bina", "satılık", "daire", 6_750_000, "2+1", 95, "Üsküdar", "Acıbadem Mh.", ["asansör", "otopark", "krediye uygun"]],
      ["Ataşehir rezidans 1+1", "kiralık", "daire", 42_000, "1+1", 70, "Ataşehir", "Barbaros Mh.", ["asansör", "otopark", "havuz", "güvenlik", "eşyalı"]],
      ["Beşiktaş Abbasağa 2+1", "kiralık", "daire", 55_000, "2+1", 90, "Beşiktaş", "Abbasağa Mh.", ["balkon", "doğalgaz"]],
      ["Çekmeköy bahçeli villa", "satılık", "villa", 21_500_000, "5+1", 320, "Çekmeköy", "Taşdelen Mh.", ["bahçe", "otopark", "havuz", "site içi"]],
      ["Kartal sahil 3+1", "satılık", "daire", 7_300_000, "3+1", 140, "Kartal", "Kordonboyu Mh.", ["asansör", "balkon", "otopark"]],
      ["Şile imarlı arsa", "satılık", "arsa", 3_900_000, null, 600, "Şile", "Ağva", []],
    ] as const
  ).map(([title, type, property_type, price, rooms, area_m2, district, location, features], i) => ({
    id: randomUUID(), title, type, property_type, price, currency: "TRY", rooms, area_m2,
    city: "İstanbul", district, location, features: [...features], images: [], image_url: null,
    description: null, listing_url: null, status: "aktif",
    owner_name: null, owner_phone: null, created_at: daysAgo([44, 38, 29, 24, 17, 11, 6, 3][i]),
  }));

  const clients = (
    [
      ["Ayşe Kaya", "0500 000 00 01", "görüştü"],
      ["Mehmet Demir", "0500 000 00 02", "yeni"],
      ["Zeynep Arslan", "0500 000 00 03", "ilgili"],
      ["Can Yılmaz", "0500 000 00 04", "teklif"],
      ["Elif Şahin", "0500 000 00 05", "yeni"],
    ] as const
  ).map(([full_name, phone, stage], i) => ({
    id: randomUUID(), full_name, phone, stage, created_at: daysAgo([40, 33, 21, 14, 8][i]),
  }));

  const demand = (client: (typeof clients)[number], o: Partial<D> & Pick<D, "type">): D => ({
    id: randomUUID(), client_id: client.id, status: "aktif", currency: "TRY",
    property_types: [], city: null, districts: [], budget_min: null, budget_max: null,
    rooms_min: null, area_min: null, area_max: null, features: [], notes: null,
    created_at: client.created_at, ...o,
  });

  const demands: D[] = [
    demand(clients[0], { type: "satılık", property_types: ["daire"], city: "İstanbul", districts: ["Kadıköy", "Üsküdar"], budget_max: 10_000_000, rooms_min: 3, area_min: 110, features: ["otopark", "asansör"] }),
    demand(clients[1], { type: "kiralık", city: "İstanbul", districts: ["Ataşehir", "Kadıköy"], budget_max: 45_000, features: ["eşyalı"] }),
    demand(clients[2], { type: "satılık", property_types: ["daire"], city: "İstanbul", budget_min: 5_000_000, budget_max: 7_000_000, rooms_min: 2, features: ["krediye uygun"] }),
    demand(clients[3], { type: "satılık", property_types: ["villa"], city: "İstanbul", budget_max: 20_000_000, features: ["bahçe", "havuz"] }),
    demand(clients[4], { type: "kiralık", city: "İstanbul", districts: ["Beşiktaş", "Şişli"], budget_max: 60_000, rooms_min: 2 }),
  ];

  let matchCount = 0;
  db.transaction(() => {
    const ip = db.prepare(`INSERT INTO properties (id,title,type,property_type,price,currency,rooms,area_m2,location,district,city,images,features,status,created_at)
      VALUES (@id,@title,@type,@property_type,@price,@currency,@rooms,@area_m2,@location,@district,@city,@images,@features,@status,@created_at)`);
    for (const p of properties) ip.run({ ...p, images: J(p.images), features: J(p.features) });

    const ic = db.prepare(`INSERT INTO clients (id,full_name,phone,stage,created_at) VALUES (@id,@full_name,@phone,@stage,@created_at)`);
    for (const c of clients) ic.run(c);

    const idm = db.prepare(`INSERT INTO demands (id,client_id,type,property_types,city,districts,budget_min,budget_max,currency,rooms_min,area_min,area_max,features,status,notes,created_at)
      VALUES (@id,@client_id,@type,@property_types,@city,@districts,@budget_min,@budget_max,@currency,@rooms_min,@area_min,@area_max,@features,@status,@notes,@created_at)`);
    for (const d of demands)
      idm.run({ ...d, property_types: J(d.property_types), districts: J(d.districts), features: J(d.features) });

    const im = db.prepare(`INSERT INTO matches (id,demand_id,property_id,score,reasons,misses,"trigger",status,created_at,updated_at)
      VALUES (?,?,?,?,?,?,'ilan','yeni',?,?)`);
    for (const d of demands)
      for (const p of properties) {
        const r = evaluate({ property: p, demand: d });
        // Eşleşme, ilan ile talepten hangisi sonra girildiyse o an oluşmuştur.
        const at = p.created_at > d.created_at ? p.created_at : d.created_at;
        if (r.match) {
          im.run(randomUUID(), d.id, p.id, r.score, J(r.reasons), J(r.misses), at, at);
          matchCount++;
        }
      }

    const ia = db.prepare(`INSERT INTO activities (id,client_id,property_id,kind,body,occurred_at,created_at) VALUES (?,?,?,?,?,?,?)`);
    const act = (c: number, p: number | null, kind: string, body: string, ago: number) =>
      ia.run(randomUUID(), clients[c].id, p == null ? null : properties[p].id, kind, body, daysAgo(ago), now());
    act(0, null, "arama", "İlk görüşme: Kadıköy/Üsküdar'da otoparklı 3+1 arıyor, eşiyle birlikte karar verecekler.", 6);
    act(0, 1, "yer gösterme", "Göztepe'deki daireyi gezdik, mutfağı küçük buldu.", 3);
    act(3, 5, "görüşme", "Villa için 20M teklif vermeyi düşünüyor.", 1);
    act(2, null, "arama", "Kredi ön onayı çıktı, 7M'ye kadar bakabiliyor.", 9);
    act(2, 2, "yer gösterme", "Acıbadem'deki daireyi gezdi, cephe konusunda kararsız.", 7);
    act(1, 3, "mesaj", "Ataşehir rezidans ilanı WhatsApp'tan iletildi.", 5);
    act(4, null, "arama", "Beşiktaş'ta 2+1 kiralık arıyor, evcil hayvanı var.", 2);

    const day = (k: number) => new Date(Date.now() + k * 864e5).toISOString().slice(0, 10);
    const iap = db.prepare(`INSERT INTO appointments (id,client_id,property_id,date,time,notes,status,created_at) VALUES (?,?,?,?,?,?,?,?)`);
    iap.run(randomUUID(), clients[0].id, properties[0].id, day(1), "14:00", "Moda'daki daire gösterimi", "bekliyor", now());
    iap.run(randomUUID(), clients[3].id, properties[5].id, day(3), "11:00", "Villa ikinci gösterim", "bekliyor", now());
  })();

  return { properties: properties.length, clients: clients.length, demands: demands.length, matches: matchCount };
}

/** Demo'yu sıfırla: kullanıcılar hariç her şey silinir, veri yeniden basılır. */
export function resetDemoData(db: Database.Database) {
  db.transaction(() => {
    for (const t of ["matches", "activities", "appointments", "demands", "clients", "properties"])
      db.prepare(`DELETE FROM ${t}`).run();
  })();
  return seedDemo(db);
}
