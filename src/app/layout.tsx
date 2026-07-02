import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import Script from "next/script";
import Link from "next/link";
import Header from "@/components/Header";
import AIChat from "@/components/AIChat";
import FeedbackButton from "@/components/FeedbackButton";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-heebo",
});

export const metadata: Metadata = {
  title: { default: "דַּיָּר – ביקורות דיירים", template: "%s | דַּיָּר" },
  description: "פלטפורמת ביקורות דיירים בישראל — קרא וכתוב ביקורות על דירות, בתים ומשכירים.",
  keywords: ["ביקורות דיירים", "שכירות", "דירה", "משכיר", "ישראל"],
  openGraph: {
    siteName: "דַּיָּר",
    locale: "he_IL",
    type: "website",
  },
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
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-C2PWQY3OJ5" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-C2PWQY3OJ5');
        `}</Script>
      </head>
      <body className={`${heebo.variable} font-[family-name:var(--font-heebo)] bg-[#f9f9f9] text-[#111] min-h-screen`}>
        {apiKey && (
          <Script
            src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=he`}
            strategy="beforeInteractive"
          />
        )}
        <Header />
        <AIChat />
        {/* Responsive container: full on mobile, centered+wider on desktop */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:right-2 bg-[#f97316] text-white px-4 py-2 rounded-xl text-sm z-50">
          דלג לתוכן הראשי
        </a>
        <div className="w-full max-w-[560px] md:max-w-[900px] mx-auto px-4 md:px-8">
          <div className="text-center py-6 border-b border-[#e5e5e5] mb-6">
            <Link href="/" className="inline-flex flex-col items-center">
              <span className="text-6xl font-black text-[#f97316] leading-tight" style={{ letterSpacing: "0.03em" }}>דַּיָּר</span>
              <span className="text-xs text-[#888] tracking-widest mt-0.5">פלטפורמת ביקורות דיירים</span>
            </Link>
          </div>
          <main id="main-content">{children}</main>
        </div>
        <FeedbackButton />
      </body>
    </html>
  );
}
