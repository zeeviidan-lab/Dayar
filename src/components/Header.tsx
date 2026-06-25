"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [highContrast, setHighContrast] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const accessRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
  }, [fontSize]);

  useEffect(() => {
    document.documentElement.classList.toggle("high-contrast", highContrast);
  }, [highContrast]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (accessRef.current && !accessRef.current.contains(e.target as Node)) setAccessOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-[#e5e5e5] shadow-sm">
        <div className="w-full px-3 md:px-6 h-12 flex items-center justify-between">

          {/* Hamburger — far left */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => { setMenuOpen((v) => !v); setAccessOpen(false); }}
              className="w-10 h-10 flex flex-col justify-center items-center gap-1.5 text-[#555] hover:text-[#f97316] transition-colors rounded-lg hover:bg-[#f5f5f5]"
              aria-label="תפריט"
            >
              <span className={`block w-5 h-0.5 bg-current transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block w-5 h-0.5 bg-current transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block w-5 h-0.5 bg-current transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>

            {/* Dropdown menu */}
            <div className={`absolute top-12 right-0 w-52 bg-white rounded-2xl shadow-xl border border-[#f0f0f0] overflow-hidden transition-all duration-200 origin-top-right ${menuOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"}`}>
              {[
                { href: "/", label: "דף הבית", icon: "🏠" },
                { href: "/terms", label: "תנאי שימוש", icon: "📄" },
                { href: "/privacy", label: "מדיניות פרטיות", icon: "🔒" },
                { href: "/contact", label: "צור קשר", icon: "✉️" },
              ].map(({ href, label, icon }) => (
                <Link key={href} href={href} onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-[#333] hover:bg-[#fff7f0] hover:text-[#f97316] transition-colors border-b border-[#f9f9f9] last:border-0">
                  <span>{icon}</span>
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div />

          {/* Accessibility — far right */}
          <div ref={accessRef} className="relative">
            <button
              onClick={() => { setAccessOpen((v) => !v); setMenuOpen(false); }}
              className="w-10 h-10 flex items-center justify-center text-2xl text-[#555] hover:text-[#f97316] transition-colors rounded-lg hover:bg-[#f5f5f5]"
              aria-label="נגישות"
            >
              ♿
            </button>

            {/* Accessibility dropdown */}
            <div className={`absolute top-12 left-0 w-64 bg-white rounded-2xl shadow-xl border border-[#f0f0f0] p-4 space-y-4 transition-all duration-200 origin-top-left ${accessOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"}`}>
              <p className="text-sm font-bold text-[#111]">נגישות</p>

              <div>
                <p className="text-xs text-[#aaa] mb-2">גודל גופן</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setFontSize((f) => Math.max(80, f - 10))}
                    className="w-9 h-9 rounded-full border border-[#e5e5e5] font-bold text-[#555] hover:border-[#f97316] hover:text-[#f97316] transition-colors text-sm">
                    A-
                  </button>
                  <span className="text-sm text-[#666] w-10 text-center">{fontSize}%</span>
                  <button onClick={() => setFontSize((f) => Math.min(150, f + 10))}
                    className="w-9 h-9 rounded-full border border-[#e5e5e5] font-bold text-[#555] hover:border-[#f97316] hover:text-[#f97316] transition-colors text-sm">
                    A+
                  </button>
                  <button onClick={() => setFontSize(100)}
                    className="text-xs text-[#bbb] hover:text-[#f97316] transition-colors">
                    איפוס
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-[#555]">ניגודיות גבוהה</p>
                <button onClick={() => setHighContrast((v) => !v)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${highContrast ? "bg-[#f97316]" : "bg-[#e5e5e5]"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${highContrast ? "left-5" : "left-0.5"}`} />
                </button>
              </div>

              <a href="https://www.gov.il/he/pages/accessibility" target="_blank" rel="noopener noreferrer"
                className="block text-xs text-[#bbb] hover:text-[#f97316] transition-colors pt-2 border-t border-[#f5f5f5]">
                הצהרת נגישות ←
              </a>
            </div>
          </div>

        </div>
      </header>

      <style>{`
        .high-contrast body { background: #fff !important; color: #000 !important; }
        .high-contrast * { border-color: #000 !important; }
        .high-contrast a, .high-contrast button { color: #0000ee !important; }
      `}</style>
    </>
  );
}
