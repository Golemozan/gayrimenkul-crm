# Gayrimenkul CRM

Gayrimenkul danışmanları için CRM. Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase.

## Özellikler

- İlanlar (portföy): çoklu foto galerisi, tapu sahibi, ilan linki, ekle/düzenle/sil
- Müşteriler: bütçe, aradığı, teklif verdiği ilan, ekle/sil
- Akıllı eşleştirme: müşterinin bütçe/tipine uyan aktif ilanlar
- Randevular: müşteri+ilan eşleştirme, ekle/düzenle/sil
- Satış hunisi (kanban): aşama takibi
- Arama + filtre + sayfalama
- Excel'e aktarma
- Dashboard grafiği, dark/light mod

## Kurulum

1. Paketleri yükle:
   ```bash
   npm install
   ```
2. Ortam değişkenleri: `.env.example` dosyasını `.env.local` olarak kopyala ve kendi
   Supabase bilgilerinle doldur:
   ```bash
   cp .env.example .env.local
   ```
3. Veritabanı: Supabase → SQL Editor'da sırayla çalıştır:
   - `supabase/schema.sql` (tüm tablolar + storage + RLS)
   - Mevcut bir DB'yi güncelliyorsan `supabase/migrations/` altındaki dosyalar
4. Geliştirme sunucusu:
   ```bash
   npm run dev
   ```
   http://localhost:3000

## Yapı

- `app/` — App Router sayfaları (Panel, İlanlar, Müşteriler, Satış Hunisi, Randevular)
- `components/` — UI bileşenleri ve formlar
- `lib/supabase/` — browser ve server Supabase client'ları
- `lib/utils.ts` — `cn` yardımcı
- `types/` — domain tipleri + DB şeması
- `supabase/` — `schema.sql` + `migrations/`

## Güvenlik notu

`schema.sql` içindeki RLS politikaları **DEMO** içindir (anon tam erişim). Prod öncesi
auth ekleyip `agent_id = auth.uid()` gibi kurallarla kısıtla. `.env.local` git'e
gönderilmez (`.gitignore`); `NEXT_PUBLIC_*` anahtarlar zaten public/publishable'dır.
