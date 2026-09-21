// SQLite şeması. Migration'lar sıralı; PRAGMA user_version hangisine kadar
// uygulandığını tutar. Yeni değişiklik = dizinin sonuna yeni eleman, eskiler
// asla düzenlenmez.

export const MIGRATIONS: string[] = [
  // 1 — ilk şema
  `
  CREATE TABLE users (
    id            TEXT PRIMARY KEY,
    username      TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    created_at    TEXT NOT NULL
  );

  CREATE TABLE properties (
    id            TEXT PRIMARY KEY,
    title         TEXT NOT NULL,
    type          TEXT NOT NULL CHECK (type IN ('satılık','kiralık')),
    property_type TEXT NOT NULL CHECK (property_type IN ('daire','villa','arsa')),
    price         REAL NOT NULL DEFAULT 0,
    currency      TEXT NOT NULL DEFAULT 'TRY' CHECK (currency IN ('TRY','USD','EUR')),
    rooms         TEXT,
    area_m2       REAL,
    location      TEXT,
    district      TEXT,
    city          TEXT,
    description   TEXT,
    image_url     TEXT,
    images        TEXT NOT NULL DEFAULT '[]',
    features      TEXT NOT NULL DEFAULT '[]',
    listing_url   TEXT,
    owner_name    TEXT,
    owner_phone   TEXT,
    status        TEXT NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif','pasif','satıldı')),
    created_at    TEXT NOT NULL
  );
  CREATE INDEX idx_properties_status ON properties(status);
  CREATE INDEX idx_properties_city   ON properties(city);

  CREATE TABLE clients (
    id                TEXT PRIMARY KEY,
    full_name         TEXT NOT NULL,
    phone             TEXT,
    email             TEXT,
    stage             TEXT NOT NULL DEFAULT 'yeni'
                      CHECK (stage IN ('yeni','ilgili','görüştü','teklif','kazanıldı','kaybedildi')),
    offer_property_id TEXT REFERENCES properties(id) ON DELETE SET NULL,
    offer_amount      REAL,
    notes             TEXT,
    created_at        TEXT NOT NULL
  );
  CREATE INDEX idx_clients_stage ON clients(stage);

  CREATE TABLE demands (
    id             TEXT PRIMARY KEY,
    client_id      TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    type           TEXT NOT NULL CHECK (type IN ('satılık','kiralık')),
    property_types TEXT NOT NULL DEFAULT '[]',
    city           TEXT,
    districts      TEXT NOT NULL DEFAULT '[]',
    budget_min     REAL,
    budget_max     REAL,
    currency       TEXT NOT NULL DEFAULT 'TRY' CHECK (currency IN ('TRY','USD','EUR')),
    rooms_min      INTEGER,
    area_min       REAL,
    area_max       REAL,
    features       TEXT NOT NULL DEFAULT '[]',
    status         TEXT NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif','pasif','karşılandı')),
    notes          TEXT,
    created_at     TEXT NOT NULL
  );
  CREATE INDEX idx_demands_client ON demands(client_id);
  CREATE INDEX idx_demands_status ON demands(status);

  CREATE TABLE matches (
    id          TEXT PRIMARY KEY,
    demand_id   TEXT NOT NULL REFERENCES demands(id) ON DELETE CASCADE,
    property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    score       INTEGER NOT NULL,
    reasons     TEXT NOT NULL DEFAULT '[]',
    misses      TEXT NOT NULL DEFAULT '[]',
    "trigger"   TEXT NOT NULL CHECK ("trigger" IN ('ilan','talep')),
    status      TEXT NOT NULL DEFAULT 'yeni'
                CHECK (status IN ('yeni','iletildi','ilgileniyor','ilgilenmedi')),
    seen_at     TEXT,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL,
    UNIQUE (demand_id, property_id)
  );
  CREATE INDEX idx_matches_property ON matches(property_id);
  CREATE INDEX idx_matches_unseen   ON matches(seen_at);

  CREATE TABLE activities (
    id          TEXT PRIMARY KEY,
    client_id   TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    property_id TEXT REFERENCES properties(id) ON DELETE SET NULL,
    kind        TEXT NOT NULL CHECK (kind IN ('arama','görüşme','yer gösterme','mesaj','not')),
    body        TEXT,
    occurred_at TEXT NOT NULL,
    created_at  TEXT NOT NULL
  );
  CREATE INDEX idx_activities_client ON activities(client_id, occurred_at);

  CREATE TABLE appointments (
    id          TEXT PRIMARY KEY,
    client_id   TEXT REFERENCES clients(id) ON DELETE CASCADE,
    property_id TEXT REFERENCES properties(id) ON DELETE SET NULL,
    date        TEXT NOT NULL,
    time        TEXT,
    notes       TEXT,
    status      TEXT NOT NULL DEFAULT 'bekliyor' CHECK (status IN ('bekliyor','tamamlandı','iptal')),
    created_at  TEXT NOT NULL
  );
  CREATE INDEX idx_appointments_client ON appointments(client_id);
  CREATE INDEX idx_appointments_date   ON appointments(date);
  `,
];
