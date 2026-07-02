import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "אודות",
  description: "הסיפור מאחורי דַּיָּר — פלטפורמת ביקורות דיירים בישראל",
};

export default function AboutPage() {
  return (
    <main className="py-8 max-w-2xl mx-auto" dir="rtl">
      <h1 className="text-2xl font-black text-[#111] mb-6">אודות דַּיָּר</h1>

      <section className="space-y-6 text-sm text-[#444] leading-relaxed">
        <p className="text-base text-[#111] font-medium">
          שוק השכירות בישראל לא שקוף מספיק. דיירים עוברים לדירות בלי לדעת על בעיות ידועות, משכירים בעייתיים, או שכנים רועשים.
        </p>

        <p>
          דַּיָּר נוצרה כדי לשנות את זה. אנחנו מאמינים שלכל דייר מגיע לדעת את האמת לפני שהוא חותם על חוזה — ולכל דייר מגיע הזכות לשתף את החוויה שלו, בצורה אנונימית וחופשית.
        </p>

        <div className="bg-[#fff8f3] border border-orange-100 rounded-xl p-5">
          <h2 className="font-bold text-[#111] mb-3">מה אנחנו מציעים</h2>
          <ul className="space-y-2 text-[#555]">
            <li>✅ ביקורות אמיתיות על דירות ומשכירים</li>
            <li>✅ אנונימיות מלאה לכותבי הביקורות</li>
            <li>✅ דירוגים לפי קטגוריות — תחזוקה, שכנים, רעש ועוד</li>
            <li>✅ ניתוח חוזי שכירות בעזרת AI</li>
            <li>✅ מידע על זכויות דיירים בישראל</li>
          </ul>
        </div>

        <p>
          אנחנו בשלב ראשוני ובונים את המאגר יחד עם הקהילה. כל ביקורת שתכתבו עוזרת לדייר הבא.
        </p>

        <div className="border-t border-[#e5e5e5] pt-6">
          <h2 className="font-bold text-[#111] mb-3">צרו קשר</h2>
          <p>שאלות, הצעות, או בעיות טכניות — נשמח לשמוע.</p>
          <a href="mailto:info@hadayar.co.il" className="text-[#f97316] underline mt-1 inline-block">
            info@hadayar.co.il
          </a>
        </div>

        <div className="text-center pt-4">
          <Link href="/?write=true"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#f97316] text-white rounded-xl font-bold hover:bg-[#fb923c] transition-colors">
            ✏️ כתוב ביקורת עכשיו
          </Link>
        </div>
      </section>
    </main>
  );
}
