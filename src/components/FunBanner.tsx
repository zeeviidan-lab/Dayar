"use client";

import { useEffect, useState } from "react";

const BANNERS = [
  {
    emoji: "🎧",
    brand: "QuietLife™",
    headline: "דוד השכנה מעל לא ישתיק",
    sub: "אבל אטמי האוזניים שלנו כן",
    cta: "קנה עכשיו",
    bg: "from-violet-50 to-purple-50",
    border: "border-purple-100",
    accent: "text-purple-500",
    badge: "פרסומת",
  },
  {
    emoji: "🔧",
    brand: "FixIt™",
    headline: "משכיר שלא מתקן?",
    sub: "אנחנו מתקנים. הוא ישלם לך אחר כך.",
    cta: "תקן איתנו",
    bg: "from-blue-50 to-sky-50",
    border: "border-blue-100",
    accent: "text-blue-500",
    badge: "פרסומת",
  },
  {
    emoji: "📦",
    brand: "MoveOut™",
    headline: "עוד חוזה, עוד דירה",
    sub: "ארגזי מעבר ב-₪0 לחברים שסבלו",
    cta: "אני סובל",
    bg: "from-[#FAF5F0] to-amber-50",
    border: "border-[#F3E6DC]",
    accent: "text-[#C25E3A]",
    badge: "פרסומת",
  },
  {
    emoji: "😴",
    brand: "SleepScore™",
    headline: "שכן רועש? שוכר עצבני?",
    sub: "מדד השינה שלך ירד. שלנו עלה.",
    cta: "שפר שינה",
    bg: "from-teal-50 to-emerald-50",
    border: "border-teal-100",
    accent: "text-teal-500",
    badge: "פרסומת",
  },
  {
    emoji: "🕵️",
    brand: "LandlordCheck™",
    headline: "בדקת את המשכיר לפני שחתמת?",
    sub: "אנחנו בדקנו. לא נעים.",
    cta: "בדוק לפני מאוחר",
    bg: "from-rose-50 to-pink-50",
    border: "border-rose-100",
    accent: "text-rose-500",
    badge: "פרסומת",
  },
];

export default function FunBanner() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % BANNERS.length);
        setVisible(true);
      }, 400);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const b = BANNERS[idx];

  return (
    <div
      className={`mt-4 rounded-2xl border bg-gradient-to-l ${b.bg} ${b.border} p-4 transition-opacity duration-400 ${visible ? "opacity-100" : "opacity-0"}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-3xl flex-shrink-0">{b.emoji}</span>
          <div className="min-w-0">
            <p className={`text-[10px] font-bold uppercase tracking-widest ${b.accent} mb-0.5`}>{b.brand}</p>
            <p className="text-sm font-bold text-[#111] leading-tight">{b.headline}</p>
            <p className="text-xs text-[#777] mt-0.5 truncate">{b.sub}</p>
          </div>
        </div>
        <button
          className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-opacity`}
          style={{ background: "linear-gradient(135deg,#C25E3A,#A94F2E)" }}
        >
          {b.cta}
        </button>
      </div>
      <p className="text-[9px] text-[#ccc] mt-2 text-left">פרסומת · sponsored</p>
    </div>
  );
}
