import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

// Build sırasında indirilir ve yerelden sunulur; çalışırken internete gerek yok.
const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "EmlakCRM",
  description: "Gayrimenkul danışmanları için CRM",
};

// Varsayılan açık tema. Koyu yalnızca kullanıcı bilerek seçtiyse (localStorage).
const themeScript = `try{if(localStorage.getItem('crm-theme')==='dark'){document.documentElement.classList.add('dark')}}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased">
        <div className="min-h-screen bg-canvas dark:bg-slate-950">{children}</div>
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
