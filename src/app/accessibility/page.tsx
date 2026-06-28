import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "הצהרת נגישות",
};

export default function AccessibilityPage() {
  return (
    <main className="py-8 max-w-2xl mx-auto" dir="rtl">
      <h1 className="text-2xl font-black text-[#111] mb-6">הצהרת נגישות</h1>

      <section className="space-y-4 text-sm text-[#444] leading-relaxed">
        <p>
          אתר <strong>דַּיָּר</strong> שם לו למטרה לאפשר שימוש נוח ונגיש לכלל המשתמשים, לרבות אנשים עם מוגבלויות.
          אנו פועלים להטמעת תקן נגישות ישראלי 5568 ברמה AA, המבוסס על הנחיות WCAG 2.1.
        </p>

        <h2 className="text-lg font-bold text-[#111] mt-6">מה כולל האתר</h2>
        <ul className="list-disc list-inside space-y-1 text-[#555]">
          <li>תמיכה מלאה בכיוון RTL (עברית)</li>
          <li>ניגודיות צבעים העומדת בדרישות התקן</li>
          <li>גופן קריא ותמיכה בהגדלת טקסט</li>
          <li>תגיות alt לתמונות</li>
        </ul>

        <h2 className="text-lg font-bold text-[#111] mt-6">מגבלות ידועות</h2>
        <p>
          אנו עובדים באופן שוטף לשיפור הנגישות. ייתכן שחלק מהתכנים עדיין אינם עומדים במלוא הדרישות.
          אנו מתחייבים לתקן ממצאים שיועברו אלינו תוך 30 ימי עבודה.
        </p>

        <h2 className="text-lg font-bold text-[#111] mt-6">יצירת קשר</h2>
        <p>
          נתקלתם בבעיית נגישות? נשמח לשמוע.
          <br />
          <a href="mailto:contact@dayar.co.il" className="text-[#f97316] underline">contact@dayar.co.il</a>
        </p>

        <h2 className="text-lg font-bold text-[#111] mt-6">עדכון אחרון</h2>
        <p>יוני 2026</p>
      </section>
    </main>
  );
}
