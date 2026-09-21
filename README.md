<div align="center">

# 🏠 Gayrimenkul CRM

**Emlak danışmanları için portföy, müşteri talebi ve otomatik eşleştirme paneli.**

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-yerel-003B57?logo=sqlite&logoColor=white)

</div>

---

## Ne yapar?

Emlakçı portföyünü ve müşterilerinin ne aradığını sisteme girer. Yeni bir ilan
**veya** yeni bir talep kaydedildiğinde sistem tüm aktif kayıtları tarar ve
"bu müşterinin kriterlerine uyan yeni bir ilan geldi" bildirimini üretir.
Müşteriyle yapılan her arama, görüşme ve yer gösterme tek bir geçmişte toplanır.

| | |
|---|---|
| 🏘️ **Portföy** | Satılık/kiralık, il/ilçe, m², oda, fiyat, özellikler (otopark, asansör…), çoklu fotoğraf |
| 🔎 **Müşteri talepleri** | Bir müşterinin birden fazla talebi: tür, il + birden çok ilçe, bütçe, en az oda, m² aralığı, istenen özellikler |
| 🎯 **Otomatik eşleştirme** | İlan veya talep kaydedilince iki yönde çalışır; puan (0–100) + tutan/eksik kriterler |
| 🔔 **Bildirim** | Zil sayacı, kayıt anında bildirim, Eşleşmeler sayfası, hazır mesajla **WhatsApp'tan gönder** |
| 🗂️ **Görüşme geçmişi** | Arama, görüşme, yer gösterme, mesaj, not; tamamlanan randevu geçmişe kendiliğinden düşer |
| 📊 **Panel** | Dönem karşılaştırmalı KPI'lar, eşleşme akışı, en yoğun gün, talep karşılama oranı |
| 📈 **Satış hunisi** | yeni → ilgili → görüştü → teklif → kazanıldı / kaybedildi |
| 🔐 **Giriş + yedek** | Şifreli giriş, günlük otomatik yedek (son 14 gün), tek tıkla yedek indirme, Excel'e aktarma |

## Eşleştirme nasıl çalışır?

`lib/matching.ts` — saf fonksiyonlar, veritabanı bilmez, birim testli.

**Sert filtreler** (biri tutmazsa eşleşme yok): ilan tipi, gayrimenkul türü, il ve
seçili ilçeler, para birimi, fiyat `bütçe min` ile `bütçe max × 1.10` arasında,
ilan ve talep aktif.

**Puan:** bütçe 30 · oda 20 · m² 20 · istenen özellikler 30. Talepte boş bırakılan
kriter tam puan alır; 50 puanın altı bildirim üretmez. Bütçeyi %10'a kadar aşan
ilan "bütçenin %7 üstünde" notuyla, düşük puanla gelir.

```bash
npm test   # eşleştirme motoru testleri (Node 24, ek bağımlılık yok)
```

## Kurulum

Gereksinim: **Node.js 22.6+** (öneri 24).

```bash
git clone https://github.com/Golemozan/gayrimenkul-crm.git
cd gayrimenkul-crm
npm install
npm run dev          # → http://localhost:3000
```

İlk açılışta **yönetici hesabı** oluşturma ekranı gelir. Başka ayar gerekmez:

- Veritabanı `data/crm.db` olarak ilk çalıştırmada oluşur.
- Oturum anahtarı (`SESSION_SECRET`) ilk `npm run dev` / `npm start`'ta `.env.local`'a otomatik yazılır.

Deneme verisiyle görmek için (yalnızca **boş** veritabanına basar):

```bash
npm run seed
```

### Yayına alma

```bash
npm run build
npm start
```

Veri dosya sisteminde durduğu için kalıcı diski olan bir sunucu gerekir
(ör. Railway + volume). Veri klasörü `DATA_DIR` ortam değişkeniyle değiştirilir;
HTTPS arkasında oturum cookie'si otomatik olarak `Secure` işaretlenir.

## Proje yapısı

```
app/(app)/           Panel, İlanlar, Müşteriler, Eşleşmeler, Satış Hunisi, Randevular, Ayarlar
app/(auth)/          Giriş ve ilk kurulum
app/actions/         Server Actions (oturum kontrolü + zod doğrulama)
app/api/             Görsel yükleme/sunma, yedek indirme
lib/matching.ts      Eşleştirme motoru (+ matching.test.ts)
lib/db/              SQLite bağlantısı, şema/migration, tablo başına sorgular
lib/auth.ts          scrypt parola, HMAC imzalı oturum
middleware.ts        Oturumsuz isteği /login'e yönlendirir
scripts/             SESSION_SECRET üretimi, demo verisi
```

## Güvenlik notları

- Parolalar `scrypt` ile tuzlanıp saklanır; giriş denemesi sınırı vardır.
- Her yazma işlemi sunucuda ikinci kez oturum kontrolünden ve `zod` doğrulamasından geçer.
- Yüklenen dosyanın gerçekten görsel olduğu içeriğinden kontrol edilir; görseller yalnızca oturum açıkken sunulur.
- `.env.local` ve `data/` git'e gönderilmez.
