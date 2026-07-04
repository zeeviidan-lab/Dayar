"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  onSearch: (query: string) => void;
}

export default function SmartSearch({ onSearch }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [value, setValue] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    function initAuto() {
      if (!inputRef.current) return;
      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: "IL" },
        fields: ["formatted_address", "geometry", "place_id"],
        types: ["address"],
      });
      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current!.getPlace();
        const addr = place.formatted_address ?? "";
        setValue(addr);
        onSearch(addr);
      });
    }

    if (window.google?.maps?.places) {
      initAuto();
    } else {
      const interval = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(interval);
          initAuto();
        }
      }, 100);
      return () => clearInterval(interval);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
    onSearch(e.target.value);
  }

  async function askAI() {
    const q = value.trim();
    if (!q || aiLoading) return;
    setAiLoading(true);
    setAiAnswer("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: q }] }),
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
          onClick={askAI}
          disabled={!value.trim() || aiLoading}
          aria-label="שאל את ה-AI"
          className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#f97316] text-white text-xl disabled:opacity-30 hover:bg-[#fb923c] transition-colors flex items-center justify-center"
        >
          {aiLoading ? "…" : "✨"}
        </button>
      </div>
      <p className="text-xs text-[#bbb] mt-1.5 text-right pr-1">
        {'למשל: "כמה זמן יש למשכיר להחזיר פיקדון?" · הקלדת כתובת מסננת את הרשימה'}
      </p>

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
