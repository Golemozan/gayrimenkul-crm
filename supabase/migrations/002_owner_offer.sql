-- Mevcut DB için ek kolonlar (veriyi silmez). Supabase SQL Editor'da çalıştır.

-- properties: tapu sahibi + ilan linki
alter table public.properties add column if not exists owner_name  text;
alter table public.properties add column if not exists owner_phone text;
alter table public.properties add column if not exists listing_url text;

-- clients: teklif verdiği ilan + teklif tutarı
alter table public.clients add column if not exists offer_property_id uuid
  references public.properties(id) on delete set null;
alter table public.clients add column if not exists offer_amount numeric(14,2);

create index if not exists idx_clients_offer_prop on public.clients (offer_property_id);
