import Link from "next/link";

const COLUMNS = [
  {
    title: "דיירים",
    links: [
      { label: "חיפוש דירה", href: "/" },
      { label: "כתיבת ביקורת", href: "/?write=true" },
      { label: "אודות דַּיָּר", href: "/about" },
    ],
  },
  {
    title: "מידע",
    links: [
      { label: "תנאי שימוש", href: "/terms" },
      { label: "מדיניות פרטיות", href: "/privacy" },
      { label: "הצהרת נגישות", href: "/accessibility" },
    ],
  },
  {
    title: "יצירת קשר",
    links: [
      { label: "צור קשר", href: "/contact" },
      { label: "info@hadayar.co.il", href: "mailto:info@hadayar.co.il" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-16 bg-[#2b2118] text-[#d8cfc7]" dir="rtl">
      <div className="w-full max-w-[560px] md:max-w-[900px] mx-auto px-4 md:px-8 py-10">
        {/* Brand */}
        <div className="mb-8">
          <span className="text-2xl font-black text-[#C25E3A]">דַּיָּר</span>
          <p className="text-sm text-[#a89a8d] mt-1">
            {"פלטפורמת ביקורות הדיירים של ישראל — שקיפות בשוק השכירות"}
          </p>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {COLUMNS.map(({ title, links }) => (
            <div key={title}>
              <p className="text-sm font-bold text-white mb-3">{title}</p>
              <ul className="space-y-2">
                {links.map(({ label, href }) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-[#a89a8d] hover:text-[#C25E3A] transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-[#8a7d70]">
          <p>{"© דַּיָּר 2026 · כל הזכויות שמורות"}</p>
          <p>{"הביקורות באתר משקפות חוויות אישיות של משתמשים בלבד"}</p>
        </div>
      </div>
    </footer>
  );
}
