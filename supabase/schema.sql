-- Gayrimenkul CRM şeması. Supabase -> SQL Editor'a yapıştır, çalıştır.
-- Tekrar çalıştırılabilir (idempotent): drop sırası FK'ye göre.

drop table if exists public.appointments cascade;
drop table if exists public.properties cascade;
drop table if exists public.clients cascade;

-- 1) İlanlar
create table public.properties (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  type          text not null check (type in ('satılık', 'kiralık')),
  property_type text not null check (property_type in ('daire', 'villa', 'arsa')),
  price         numeric(14,2) not null default 0,
  currency      text not null default 'TRY' check (currency in ('TRY', 'USD', 'EUR')),
  rooms         text,
  area_m2       numeric(10,2),
  location      text,
  district      text,
  city          text,
  description   text,
  image_url     text,
  images        text[] not null default '{}',
  listing_url   text,
  owner_name    text,
  owner_phone   text,
  status        text not null default 'aktif' check (status in ('aktif', 'pasif', 'satıldı')),
  created_at    timestamptz not null default now()
);

-- 2) Müşteriler
create table public.clients (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null,
  phone       text,
  email       text,
  budget_min  numeric(14,2),
  budget_max  numeric(14,2),
  looking_for text check (looking_for in ('satılık', 'kiralık')),
  stage       text not null default 'yeni'
              check (stage in ('yeni','ilgili','görüştü','teklif','kazanıldı','kaybedildi')),
  offer_property_id uuid references public.properties(id) on delete set null,
  offer_amount numeric(14,2),
  notes       text,
  created_at  timestamptz not null default now()
);

-- 3) Randevular
create table public.appointments (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid references public.clients(id) on delete cascade,
  property_id uuid references public.properties(id) on delete set null,
  date        date not null,
  time        time,
  notes       text,
  status      text not null default 'bekliyor' check (status in ('bekliyor', 'tamamlandı', 'iptal')),
  created_at  timestamptz not null default now()
);

-- İndeksler (sık filtreler + FK lookup)
create index idx_properties_status   on public.properties (status);
create index idx_properties_type     on public.properties (type);
create index idx_properties_city     on public.properties (city);
create index idx_appointments_client on public.appointments (client_id);
create index idx_appointments_prop   on public.appointments (property_id);
create index idx_appointments_date   on public.appointments (date);
create index idx_clients_offer_prop   on public.clients (offer_property_id);
create index idx_clients_stage        on public.clients (stage);

-- Row Level Security
alter table public.properties   enable row level security;
alter table public.clients      enable row level security;
alter table public.appointments enable row level security;

-- DEMO politikaları: anon tam erişim (auth yokken app çalışsın).
-- PROD ÖNCESİ daralt: ör. authenticated + agent_id = auth.uid().
create policy "demo_all_properties"   on public.properties   for all using (true) with check (true);
create policy "demo_all_clients"      on public.clients      for all using (true) with check (true);
create policy "demo_all_appointments" on public.appointments for all using (true) with check (true);

-- ---------------------------------------------------------------------------
-- Storage: ilan fotoğrafları için public bucket + politikalar.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do nothing;

-- Politikalar (idempotent: önce drop)
drop policy if exists "property_images_read"   on storage.objects;
drop policy if exists "property_images_insert" on storage.objects;
drop policy if exists "property_images_delete" on storage.objects;

-- DEMO: herkes okuyabilir/yükleyebilir/silebilir. PROD öncesi daralt.
create policy "property_images_read" on storage.objects
  for select using (bucket_id = 'property-images');

create policy "property_images_insert" on storage.objects
  for insert with check (bucket_id = 'property-images');

create policy "property_images_delete" on storage.objects
  for delete using (bucket_id = 'property-images');
