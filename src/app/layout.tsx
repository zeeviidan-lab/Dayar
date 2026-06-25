import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import Script from "next/script";
import Link from "next/link";
import Header from "@/components/Header";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-heebo",
});

export const metadata: Metadata = {
  title: "דַּיָּר – פלטפורמת ביקורות דיירים",
  description: "פלטפורמת ביקורות דיירים בישראל",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  return (
    <html lang="he" dir="rtl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={`${heebo.variable} font-[family-name:var(--font-heebo)] bg-[#f9f9f9] text-[#111] min-h-screen`}>
        {apiKey && (
          <Script
            src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=he`}
            strategy="beforeInteractive"
          />
        )}
        <Header />
        {/* Responsive container: full on mobile, centered+wider on desktop */}
        <div className="w-full max-w-[560px] md:max-w-[900px] mx-auto px-4 md:px-8">
          <div className="text-center py-6 border-b border-[#e5e5e5] mb-6">
            <Link href="/" className="inline-flex flex-col items-center">
              <span className="text-6xl font-black text-[#f97316] tracking-tight leading-tight">דַּיָּר</span>
              <span className="text-xs text-[#bbb] tracking-widest mt-0.5">פלטפורמת ביקורות דיירים</span>
            </Link>
          </div>
          {children}
        </div>
      </body>
    </html>
  );
}
