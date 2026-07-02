"use client";

import { useState } from "react";

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"bug" | "suggestion">("suggestion");
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleSubmit() {
    if (!text.trim()) return;
    setSending(true);
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, text }),
    });
    setSending(false);
    setSent(true);
    setTimeout(() => { setOpen(false); setSent(false); setText(""); }, 2000);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-4 z-40 bg-white border border-[#e5e5e5] text-[#888] text-xs px-3 py-2 rounded-full shadow-sm hover:border-[#f97316] hover:text-[#f97316] transition-colors"
      >
        💬 פידבק
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div role="dialog" aria-modal="true" className="bg-white rounded-2xl w-full max-w-[480px] p-6 mb-4 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-[#111]">פידבק</h2>
              <button onClick={() => setOpen(false)} aria-label="סגור" className="text-[#aaa] hover:text-[#111] text-2xl leading-none">×</button>
            </div>

            {sent ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-2">🙏</div>
                <p className="font-bold text-[#111]">תודה! קיבלנו.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setType("suggestion")}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${type === "suggestion" ? "bg-[#f97316] text-white border-[#f97316]" : "border-[#e5e5e5] text-[#666]"}`}
                  >
                    💡 הצעה לשיפור
                  </button>
                  <button
                    onClick={() => setType("bug")}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${type === "bug" ? "bg-[#f97316] text-white border-[#f97316]" : "border-[#e5e5e5] text-[#666]"}`}
                  >
                    🐛 דיווח על באג
                  </button>
                </div>

                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={type === "bug" ? "תאר את הבעיה שנתקלת בה..." : "מה היית רוצה לראות באתר?"}
                  rows={4}
                  dir="rtl"
                  className="w-full bg-[#f5f5f5] border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm text-[#111] placeholder-[#aaa] focus:outline-none focus:border-[#f97316] resize-none"
                />

                <button
                  onClick={handleSubmit}
                  disabled={sending || !text.trim()}
                  className="w-full py-3 bg-[#f97316] text-white rounded-xl font-bold text-sm disabled:opacity-40 hover:bg-[#fb923c] transition-colors"
                >
                  {sending ? "שולח..." : "שלח"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
