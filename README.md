<div align="center">

# 🏠 Gayrimenkul CRM

**Gayrimenkul danışmanları için modern, açık kaynak müşteri & portföy yönetim paneli.**

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-DB%20%26%20Storage-3FCF8E?logo=supabase&logoColor=white)

</div>

---

## ✨ Özellikler

| | |
|---|---|
| 🏘️ **İlan Yönetimi** | Çoklu fotoğraf galerisi, tapu sahibi bilgisi, ilan linki, fiyat/oda/m² · ekle · düzenle · sil |
| 👥 **Müşteri Yönetimi** | Bütçe, aradığı tip, teklif verdiği ilan, iletişim · ekle · sil |
| 🎯 **Akıllı Eşleştirme** | Müşterinin bütçe ve tipine uyan aktif ilanları otomatik listeler |
| 📊 **Satış Hunisi (Kanban)** | yeni → ilgili → görüştü → teklif → kazanıldı / kaybedildi |
| 📅 **Randevular** | Müşteri + ilan eşleştirip tarih/saat/durum takibi · ekle · düzenle · sil |
| 🔎 **Arama, Filtre & Sayfalama** | Şehir, fiyat aralığı, tür, durum, aşama filtreleri |
| 📈 **Dashboard** | İstatistik kartları + ilan dağılım grafiği |
| 📤 **Excel'e Aktarma** | İlan ve müşteri listelerini `.xlsx` indir |
| 🌙 **Dark / Light Mod** | Kalıcı tema (localStorage), tüm arayüzde |

## 🧱 Teknolojiler

- **Next.js 14** (App Router, Server Components)
- **TypeScript** · **Tailwind CSS**
- **Supabase** — PostgreSQL veritabanı + Storage (görseller) + RLS
- **xlsx** (Excel export) · **lucide-react** (ikonlar)

## 🚀 Kurulum

```bash
# 1) Klonla
git clone https://github.com/OzanAkdnz/gayrimenkul-crm.git
cd gayrimenkul-crm

# 2) Bağımlılıklar
npm install

# 3) Ortam değişkenleri
cp .env.example .env.local
# .env.local içine kendi Supabase URL + anon key bilgilerini yaz
```

### Veritabanı

Supabase → **SQL Editor**'da çalıştır:

1. `supabase/schema.sql` — tüm tablolar, storage bucket ve RLS politikaları
2. Mevcut bir DB'yi güncelliyorsan: `supabase/migrations/` altındaki dosyalar

```bash
# 4) Geliştirme sunucusu
npm run dev
# → http://localhost:3000
```

## 📁 Proje Yapısı

```
app/                 # App Router sayfaları (Panel, İlanlar, Müşteriler, Satış Hunisi, Randevular)
components/          # UI bileşenleri, formlar, filtreler
  └─ ui/             # shadcn tarzı bileşenler
lib/supabase/        # Browser & server Supabase client'ları
lib/utils.ts         # cn() yardımcı
types/               # Domain tipleri + DB şeması
supabase/            # schema.sql + migrations/
```

## 🔐 Güvenlik Notu

> `schema.sql` içindeki RLS politikaları **DEMO** içindir (anon tam erişim).
> Üretim öncesi kullanıcı girişi (auth) ekleyip `agent_id = auth.uid()` gibi
> kurallarla kısıtlayın.

- `.env.local` git'e **gönderilmez** (`.gitignore`).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` zaten public/publishable bir anahtardır; asıl
  koruma RLS politikalarındadır.

---

<div align="center">
Made with ❤️ + <a href="https://claude.com/claude-code">Claude Code</a>
</div>
