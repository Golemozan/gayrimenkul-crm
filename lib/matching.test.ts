// node --test lib/matching.test.ts  (Node 22.6+ type stripping; ek bağımlılık yok)
import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluate, parseRooms, type MatchInput } from "./matching.ts";

const property: MatchInput["property"] = {
  status: "aktif",
  type: "satılık",
  property_type: "daire",
  price: 8_000_000,
  currency: "TRY",
  rooms: "3+1",
  area_m2: 130,
  city: "İstanbul",
  district: "Kadıköy",
  features: ["otopark", "asansör"],
};

const demand: MatchInput["demand"] = {
  status: "aktif",
  type: "satılık",
  property_types: ["daire"],
  city: "İstanbul",
  districts: ["Kadıköy", "Üsküdar"],
  budget_min: null,
  budget_max: 10_000_000,
  currency: "TRY",
  rooms_min: 3,
  area_min: 100,
  area_max: 150,
  features: ["otopark"],
};

const run = (p: Partial<MatchInput["property"]> = {}, d: Partial<MatchInput["demand"]> = {}) =>
  evaluate({ property: { ...property, ...p }, demand: { ...demand, ...d } });

test("tam uyum → 100 puan", () => {
  const r = run();
  assert.equal(r.match, true);
  if (r.match) {
    assert.equal(r.score, 100);
    assert.deepEqual(r.misses, []);
  }
});

test("ilan tipi farklı → eşleşme yok", () => {
  assert.equal(run({ type: "kiralık" }).match, false);
});

test("tür listede değil → eşleşme yok", () => {
  assert.equal(run({ property_type: "villa" }).match, false);
});

test("il farklı → yok; il büyük/küçük harf duyarsız", () => {
  assert.equal(run({ city: "Ankara" }).match, false);
  assert.equal(run({ city: "istanbul" }).match, true);
});

test("ilçe listede değil → yok; ilçe listesi boşsa ilin tamamı", () => {
  assert.equal(run({ district: "Beşiktaş" }).match, false);
  assert.equal(run({ district: "Beşiktaş" }, { districts: [] }).match, true);
});

test("bütçenin %5 üstü → eşleşir, puan düşer, neden yazılır", () => {
  const r = run({ price: 10_500_000 });
  assert.equal(r.match, true);
  if (r.match) {
    assert.equal(r.score, 85);
    assert.ok(r.misses.includes("bütçenin %5 üstünde"));
  }
});

test("bütçenin %15 üstü → eşleşme yok", () => {
  assert.equal(run({ price: 11_500_000 }).match, false);
});

test("budget_min altı → yok", () => {
  assert.equal(run({ price: 4_000_000 }, { budget_min: 5_000_000 }).match, false);
});

test("para birimi farklı (bütçe varken) → yok; bütçe yoksa önemsiz", () => {
  assert.equal(run({ currency: "USD" }).match, false);
  assert.equal(
    run({ currency: "USD" }, { budget_max: null, budget_min: null }).match,
    true
  );
});

test("boş kriterler → tam puan", () => {
  const r = run(
    {},
    {
      property_types: [],
      city: null,
      districts: [],
      budget_max: null,
      rooms_min: null,
      area_min: null,
      area_max: null,
      features: [],
    }
  );
  assert.equal(r.match, true);
  if (r.match) assert.equal(r.score, 100);
});

test("eksik özellik → puan düşer, miss yazılır", () => {
  const r = run({}, { features: ["otopark", "havuz"] });
  assert.equal(r.match, true);
  if (r.match) {
    assert.equal(r.score, 85);
    assert.ok(r.misses.includes("havuz yok"));
  }
});

test("pasif ilan veya pasif talep → yok", () => {
  assert.equal(run({ status: "pasif" }).match, false);
  assert.equal(run({}, { status: "karşılandı" }).match, false);
});

test("oda, m² ve özellik hepsi tutmazsa MIN_SCORE altında kalır", () => {
  const r = run({ rooms: "1+1", area_m2: 60, features: [] });
  assert.equal(r.match, false);
});

test("parseRooms", () => {
  assert.equal(parseRooms("3+1"), 3);
  assert.equal(parseRooms("4+2"), 4);
  assert.equal(parseRooms("Stüdyo"), 1);
  assert.equal(parseRooms("1+0"), 1);
  assert.equal(parseRooms("Müstakil"), null);
  assert.equal(parseRooms(null), null);
});
