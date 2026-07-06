import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="py-8 space-y-6">
      <Link href="/" className="text-[#C25E3A] text-sm">{"← חזרה"}</Link>
      <h1 className="text-2xl font-black text-[#C25E3A]">{"מדיניות פרטיות"}</h1>

      <div className="text-sm text-[#666] leading-relaxed space-y-4">
        <p>{"עדכון אחרון: יוני 2026"}</p>

        <section>
          <h2 className="text-[#111] font-semibold mb-2">{"1. מידע שאנו אוספים"}</h2>
          <p>{"בעת כתיבת ביקורת אנו שומרים: את טקסט הביקורת, הדירוגים שנבחרו, התגיות שנבחרו, תמונות שהועלו, והאם הביקורת אנונימית. איננו אוספים שם, כתובת דואר אלקטרוני או פרטים מזהים אחרים ללא הסכמה מפורשת."}</p>
        </section>

        <section>
          <h2 className="text-[#111] font-semibold mb-2">{"2. שימוש במידע"}</h2>
          <p>{"המידע משמש אך ורק להצגת ביקורות בפלטפורמה. איננו מוכרים, משכירים או משתפים את המידע עם צדדים שלישיים לצורכי פרסום."}</p>
        </section>

        <section>
          <h2 className="text-[#111] font-semibold mb-2">{"3. עוגיות"}</h2>
          <p>{"הפלטפורמה משתמשת בעוגיות טכניות לצורך תפקוד תקין, וכן בכלי Google Analytics למדידה סטטיסטית ואנונימית של השימוש באתר. איננו משתמשים בעוגיות פרסום, והמידע הסטטיסטי אינו משמש לזיהוי אישי."}</p>
        </section>

        <section>
          <h2 className="text-[#111] font-semibold mb-2">{"4. אחסון נתונים"}</h2>
          <p>{"הנתונים מאוחסנים בשרתי Supabase ומוגנים בהצפנה בהעברה ובאחסון. לפרטים על מדיניות האחסון של Supabase ראו supabase.com/privacy."}</p>
        </section>

        <section>
          <h2 className="text-[#111] font-semibold mb-2">{"5. זכות עיון ומחיקה"}</h2>
          <p>{"בהתאם לחוק הגנת הפרטיות (תשמ\"א–1981), כל משתמש רשאי לבקש עיון במידע שנשמר עליו או מחיקתו. לפנייה: "}
            <Link href="/contact" className="text-[#C25E3A] underline">{"צור קשר"}</Link>
            {"."}
          </p>
        </section>

        <section>
          <h2 className="text-[#111] font-semibold mb-2">{"6. Google Maps"}</h2>
          <p>{"הפלטפורמה משתמשת בשירות Google Maps לצורך חיפוש כתובות והצגת מיקומים ותמונות Street View. השימוש כפוף למדיניות הפרטיות של Google."}</p>
        </section>

        <section>
          <h2 className="text-[#111] font-semibold mb-2">{"7. גיל מינימום"}</h2>
          <p>{"הפלטפורמה מיועדת למשתמשים בני 18 ומעלה. שימוש על-ידי קטינים אסור ללא אישור הורה."}</p>
        </section>
      </div>
    </main>
  );
}
