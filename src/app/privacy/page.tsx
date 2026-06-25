import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="py-8 space-y-6">
      <Link href="/" className="text-[#f97316] text-sm">{"← חזרה"}</Link>
      <h1 className="text-2xl font-black text-[#f97316]">{"מדיניות פרטיות"}</h1>

      <div className="text-sm text-[#666] leading-relaxed space-y-4">
        <p>{"עדכון אחרון: ינואר 2025"}</p>

        <section>
          <h2 className="text-[#111] font-semibold mb-2">{"1. מידע שאנו אוספים"}</h2>
          <p>{"בעת כתיבת ביקורת אנו שומרים: את טקסט הביקורת, הדירוגים שנבחרו, התגיות שנבחרו, והאם הביקורת אנונימית. איננו אוספים שם, כתובת דואר אלקטרוני או פרטים מזהים אחרים ללא הסכמה מפורשת."}</p>
        </section>

        <section>
          <h2 className="text-[#111] font-semibold mb-2">{"2. שימוש במידע"}</h2>
          <p>{"המידע משמש אך ורק להצגת ביקורות בפלטפורמה. איננו מוכרים, משכירים או משתפים את המידע עם צדדים שלישיים לצורכי פרסום."}</p>
        </section>

        <section>
          <h2 className="text-[#111] font-semibold mb-2">{"3. עוגיות"}</h2>
          <p>{"הפלטפורמה עשויה להשתמש בעוגיות טכניות בלבד לצורך תפקוד תקין. איננו משתמשים בעוגיות מעקב או פרסום."}</p>
        </section>

        <section>
          <h2 className="text-[#111] font-semibold mb-2">{"4. אחסון נתונים"}</h2>
          <p>{"הנתונים מאוחסנים בשרתי Supabase באירופה ומוגנים בהצפנה בהעברה ובאחסון."}</p>
        </section>

        <section>
          <h2 className="text-[#111] font-semibold mb-2">{"5. זכות מחיקה"}</h2>
          <p>{"כל משתמש רשאי לבקש מחיקת ביקורת שכתב. לפנייה: צור קשר דרך האתר."}</p>
        </section>

        <section>
          <h2 className="text-[#111] font-semibold mb-2">{"6. Google Maps"}</h2>
          <p>{"הפלטפורמה משתמשת בשירות Google Maps לצורך חיפוש כתובות והצגת מיקומים. השימוש כפוף למדיניות הפרטיות של Google."}</p>
        </section>
      </div>
    </main>
  );
}
