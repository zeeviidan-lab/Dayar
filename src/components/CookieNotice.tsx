"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("dayar_cookie_notice")) setVisible(true);
  }, []);

  function dismiss() {
    localStorage.setItem("dayar_cookie_notice", "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      dir="rtl"
      className="fixed bottom-4 right-4 left-4 md:right-auto md:max-w-sm z-40 bg-white border border-[#e5e5e5] rounded-2xl shadow-lg p-4"
    >
      <p className="text-sm font-bold text-[#111] mb-1">{"🍪 עוגיות"}</p>
      <p className="text-xs text-[#666] leading-relaxed">
        {"אנחנו משתמשים בעוגיות לתפעול האתר ולסטטיסטיקת שימוש אנונימית. פרטים נוספים ב"}
        <Link href="/privacy" className="text-[#f97316] underline">{"מדיניות הפרטיות"}</Link>
        {"."}
      </p>
      <div className="flex justify-start mt-3">
        <button
          onClick={dismiss}
          className="text-sm bg-[#f97316] text-white font-bold px-5 py-2 rounded-xl hover:bg-[#fb923c] transition-colors"
        >
          {"הבנתי"}
        </button>
      </div>
    </div>
  );
}
