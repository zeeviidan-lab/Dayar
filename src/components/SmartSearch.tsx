"use client";

import { useEffect, useRef, useState } from "react";
import { getTurnstileToken } from "@/lib/turnstile-client";
import { fetchAddressSuggestions, type AddressSuggestion } from "@/lib/places-client";

interface Props {
  onSearch: (query: string) => void;
}

// Address-shaped input gets suggestions; question-shaped input doesn't
// (saves Places API quota when people type questions for the AI).
function looksLikeAddress(q: string): boolean {
  return !q.includes("?") && q.trim().split(/\s+/).length <= 5;
}

export default function SmartSearch({ onSearch }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [selected, setSelected] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!value.trim() || value === selected || !looksLikeAddress(value)) {
      setSuggestions([]);
      return;
    }
    const t = setTimeout(async () => {
      setSuggestions(await fetchAddressSuggestions(value));
    }, 250);
    return () => clearTimeout(t);
  }, [value, selected]);

  function selectSuggestion(s: AddressSuggestion) {
    setSuggestions([]);
    setSelected(s.label);
    setValue(s.label);
    onSearch(s.label);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
    onSearch(e.target.value);
  }

  async function askAI(text?: string) {
    const q = (text ?? value).trim();
    if (!q || aiLoading) return;
    if (text) setValue(text);
    setAiLoading(true);
    setAiAnswer("");
    try {
      const turnstileToken = await getTurnstileToken();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: q }], turnstileToken }),
      });
      const data = await res.json();
      setAiAnswer(data.reply ?? "שגיאה, נסו שוב");
    } catch {
      setAiAnswer("שגיאה, נסו שוב");
    }
    setAiLoading(false);
  }

  return (
    <div>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="חפשו כתובת או שאלו שאלה..."
          aria-label="חיפוש כתובת או שאלה על זכויות דיירים"
          className="w-full bg-white border-2 border-[#f97316]/60 rounded-2xl pr-4 pl-14 py-4 text-[#111] placeholder-[#aaa] focus:outline-none focus:border-[#f97316] shadow-sm transition-colors text-right"
          dir="rtl"
        />
        <button
          onClick={() => askAI()}
          disabled={!value.trim() || aiLoading}
          aria-label="שאל את ה-AI"
          className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#f97316] text-white text-xl disabled:opacity-30 hover:bg-[#fb923c] transition-colors flex items-center justify-center"
        >
          {aiLoading ? "…" : "✨"}
        </button>
        {suggestions.length > 0 && (
          <ul className="absolute right-0 left-0 top-full mt-1 bg-white border border-[#e5e5e5] rounded-xl shadow-lg z-20 overflow-hidden" dir="rtl">
            {suggestions.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => selectSuggestion(s)}
                  className="w-full text-right px-4 py-2.5 text-sm hover:bg-[#fff8f3] transition-colors border-b border-[#f0f0f0] last:border-b-0"
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Tappable examples — one tap runs the question */}
      <div className="flex flex-wrap gap-2 mt-2.5 justify-center">
        {[
          "כמה זמן יש למשכיר להחזיר פיקדון?",
          "מה חשוב לבדוק לפני חתימה על חוזה?",
          "האם מותר להעלות שכר דירה באמצע חוזה?",
        ].map((q) => (
          <button
            key={q}
            onClick={() => askAI(q)}
            disabled={aiLoading}
            className="text-xs text-[#666] bg-white border border-[#e5e5e5] rounded-full px-3.5 py-2 hover:border-[#f97316] hover:text-[#f97316] transition-colors disabled:opacity-50"
          >
            {"✨ "}{q}
          </button>
        ))}
      </div>

      {(aiLoading || aiAnswer) && (
        <div className="mt-3 bg-[#fff8f3] border border-orange-200 rounded-xl p-4 relative" dir="rtl">
          <button
            onClick={() => setAiAnswer("")}
            aria-label="סגור תשובה"
            className="absolute left-3 top-3 text-[#bbb] hover:text-[#555]"
          >
            ✕
          </button>
          {aiLoading ? (
            <p className="text-sm text-[#888] animate-pulse">{"חושב..."}</p>
          ) : (
            <>
              <p className="text-sm text-[#333] leading-relaxed whitespace-pre-wrap">{aiAnswer}</p>
              <p className="text-xs text-[#bbb] mt-2">{"מידע כללי בלבד — לא תחליף לייעוץ משפטי"}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
