-- Satış hunisi (clients.stage) + çoklu foto (properties.images). Veriyi silmez.

-- Pipeline aşaması
alter table public.clients add column if not exists stage text
  not null default 'yeni'
  check (stage in ('yeni','ilgili','görüştü','teklif','kazanıldı','kaybedildi'));

create index if not exists idx_clients_stage on public.clients (stage);

-- Çoklu görsel (galeri). image_url kapak olarak kalır (geriye uyumlu).
alter table public.properties add column if not exists images text[]
  not null default '{}';
