"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [highContrast, setHighContrast] = useState(false);
  const [grayscale, setGrayscale] = useState(false);
  const [underlineLinks, setUnderlineLinks] = useState(false);
  const [noMotion, setNoMotion] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const accessRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
  }, [fontSize]);

  useEffect(() => {
    document.documentElement.classList.toggle("high-contrast", highContrast);
  }, [highContrast]);

  useEffect(() => {
    document.documentElement.classList.toggle("grayscale-mode", grayscale);
  }, [grayscale]);

  useEffect(() => {
    document.documentElement.classList.toggle("underline-links", underlineLinks);
  }, [underlineLinks]);

  useEffect(() => {
    document.documentElement.classList.toggle("no-motion", noMotion);
  }, [noMotion]);

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
        </div>
      </header>

      {/* Accessibility — floating on the right edge */}
      <div ref={accessRef}>
        <button
          onClick={() => { setAccessOpen((v) => !v); setMenuOpen(false); }}
          className="fixed right-0 top-1/3 z-40 w-12 h-12 rounded-l-full bg-[#f97316] text-white shadow-lg flex items-center justify-center hover:bg-[#fb923c] transition-colors"
          aria-label="תפריט נגישות"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z" />
          </svg>
        </button>

        {/* Accessibility panel */}
        <div className={`fixed right-14 top-1/3 z-40 w-64 bg-white rounded-2xl shadow-xl border border-[#f0f0f0] p-4 space-y-4 transition-all duration-200 origin-top-right ${accessOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"}`}>
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

              {[
                { label: "ניגודיות גבוהה", value: highContrast, toggle: () => setHighContrast((v) => !v) },
                { label: "גווני אפור", value: grayscale, toggle: () => setGrayscale((v) => !v) },
                { label: "הדגשת קישורים", value: underlineLinks, toggle: () => setUnderlineLinks((v) => !v) },
                { label: "עצירת אנימציות", value: noMotion, toggle: () => setNoMotion((v) => !v) },
              ].map(({ label, value, toggle }) => (
                <div key={label} className="flex items-center justify-between">
                  <p className="text-sm text-[#555]">{label}</p>
                  <button onClick={toggle} role="switch" aria-checked={value} aria-label={label}
                    className={`w-11 h-6 rounded-full transition-colors relative ${value ? "bg-[#f97316]" : "bg-[#e5e5e5]"}`}>
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${value ? "left-5" : "left-0.5"}`} />
                  </button>
                </div>
              ))}

              <Link href="/accessibility"
                className="block text-xs text-[#bbb] hover:text-[#f97316] transition-colors pt-2 border-t border-[#f5f5f5]">
                הצהרת נגישות ←
              </Link>
            </div>
          </div>

      <style>{`
        .high-contrast body { background: #fff !important; color: #000 !important; }
        .high-contrast * { border-color: #000 !important; }
        .high-contrast a, .high-contrast button { color: #0000ee !important; }
        .grayscale-mode { filter: grayscale(1); }
        .underline-links a { text-decoration: underline !important; }
        .no-motion *, .no-motion *::before, .no-motion *::after {
          animation: none !important;
          transition: none !important;
        }
      `}</style>
    </>
  );
}
