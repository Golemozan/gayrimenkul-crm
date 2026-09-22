// Canlı demo modu (portfolyo vitrini). NEXT_PUBLIC_ öneki: derlemede hem sunucuya,
// hem tarayıcıya, hem Edge middleware'e gömülür — üçü aynı değeri görür.
//
// Demoda: şifre yok (herkes aynı demo kullanıcısı), veri geçici dizinde ve boşsa
// kendiliğinden basılır, "Demoyu sıfırla" var, fotoğraf yükleme ve WhatsApp kapalı.
export const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "1";

export const DEMO_USER = { id: "demo-user", username: "demo" } as const;
