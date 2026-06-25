import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="py-8 space-y-6 max-w-lg mx-auto">
      <Link href="/" className="text-[#f97316] text-sm">{"← חזרה"}</Link>
      <h1 className="text-2xl font-black text-[#f97316]">{"צור קשר"}</h1>

      <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 space-y-4 shadow-sm">
        <p className="text-sm text-[#666]">{"לפניות בנושאים הבאים:"}</p>
        <ul className="text-sm text-[#666] space-y-1 list-disc list-inside">
          <li>{"בקשת הסרת ביקורת"}</li>
          <li>{"דיווח על תוכן פוגעני"}</li>
          <li>{"זכות עיון ומחיקת מידע אישי"}</li>
          <li>{"שאלות כלליות"}</li>
        </ul>

        <div className="border-t border-[#f5f5f5] pt-4 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xl">📧</span>
            <div>
              <p className="text-xs text-[#aaa]">{"דואר אלקטרוני"}</p>
              <a href="mailto:zeevi.idan@gmail.com" className="text-[#f97316] text-sm font-medium hover:underline">
                {"zeevi.idan@gmail.com"}
              </a>
            </div>
          </div>
          <p className="text-xs text-[#bbb]">{"נשתדל להשיב תוך 14 ימי עסקים."}</p>
        </div>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-[#888]">
        <p className="font-medium text-[#555] mb-1">{"בקשת הסרת ביקורת"}</p>
        <p>{"אנא ציין בפנייתך: כתובת הנכס, תוכן הביקורת, והסיבה לבקשת ההסרה. הפלטפורמה תבחן את הבקשה בהתאם לחוק איסור לשון הרע."}</p>
      </div>

      <div className="flex gap-4 text-xs text-[#bbb] justify-center pt-2">
        <Link href="/terms" className="hover:text-[#f97316]">{"תנאי שימוש"}</Link>
        <span>{"·"}</span>
        <Link href="/privacy" className="hover:text-[#f97316]">{"מדיניות פרטיות"}</Link>
      </div>
    </main>
  );
}
