"use client";

import { useState, useRef, useEffect } from "react";

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "האם המשכיר יכול להיכנס לדירה בלי רשות?",
  "כמה זמן יש למשכיר להחזיר פיקדון?",
  "מה עושים אם המשכיר לא מתקן תקלות?",
  "האם מותר להעלות שכירות באמצע חוזה?",
];

export default function AIChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"chat" | "contract">("chat");
  const [contractLoading, setContractLoading] = useState(false);
  const [contractResult, setContractResult] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function handleContractUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setContractLoading(true);
    setContractResult("");
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/review-contract", { method: "POST", body: formData });
    if (!res.ok || !res.body) {
      setContractResult("שגיאה בניתוח");
      setContractLoading(false);
      return;
    }
    setContractLoading(false);
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let result = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += decoder.decode(value, { stream: true });
      setContractResult(result);
    }
  }

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages }),
    });
    const data = await res.json();
    setMessages([...newMessages, { role: "assistant", content: data.reply }]);
    setLoading(false);
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "fixed", bottom: "24px", left: "24px", zIndex: 100,
          background: "#f97316", color: "white", border: "none", borderRadius: "50px",
          padding: "12px 20px", fontFamily: "Heebo, Arial, sans-serif",
          fontSize: "14px", fontWeight: "bold", cursor: "pointer",
          boxShadow: "0 4px 20px rgba(249,115,22,0.4)",
          display: "flex", alignItems: "center", gap: "8px",
        }}>
        {open ? "✕ סגור" : "⚖️ עוזר דיירים AI"}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: "fixed", bottom: "80px", left: "24px", zIndex: 100,
          width: "340px", maxHeight: "500px",
          background: "white", borderRadius: "20px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
          display: "flex", flexDirection: "column",
          fontFamily: "Heebo, Arial, sans-serif",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{ background: "#f97316", padding: "16px", color: "white" }}>
            <p style={{ margin: 0, fontWeight: "bold", fontSize: "15px" }}>⚖️ עוזר דיירים AI</p>
            <p style={{ margin: "4px 0 0", fontSize: "12px", opacity: 0.85 }}>מידע על זכויות דיירים וסקירת חוזים</p>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid #f0f0f0" }}>
            {(["chat", "contract"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                style={{
                  flex: 1, padding: "10px", border: "none", cursor: "pointer",
                  background: tab === t ? "#fff8f3" : "white",
                  color: tab === t ? "#f97316" : "#888",
                  fontWeight: tab === t ? "bold" : "normal",
                  fontSize: "13px", borderBottom: tab === t ? "2px solid #f97316" : "none",
                  fontFamily: "Heebo, Arial, sans-serif",
                }}>
                {t === "chat" ? "💬 שאל שאלה" : "📄 סקירת חוזה"}
              </button>
            ))}
          </div>

          {/* Contract tab */}
          {tab === "contract" && (
            <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
              <p style={{ fontSize: "13px", color: "#666", textAlign: "right", marginBottom: "12px" }}>
                העלה חוזה שכירות (PDF) וקבל סקירה מפורטת
              </p>
              <input ref={fileInputRef} type="file" accept=".pdf,.txt,.doc,.docx" className="hidden"
                onChange={handleContractUpload} style={{ display: "none" }} />
              <button onClick={() => fileInputRef.current?.click()} disabled={contractLoading}
                style={{
                  display: "block", width: "100%", padding: "12px",
                  background: contractLoading ? "#fde8d3" : "#f97316",
                  color: "white", border: "none", borderRadius: "12px",
                  fontSize: "14px", fontWeight: "bold", cursor: contractLoading ? "not-allowed" : "pointer",
                  fontFamily: "Heebo, Arial, sans-serif", marginBottom: "12px",
                }}>
                {contractLoading ? "מנתח חוזה... ⏳" : "📄 העלה חוזה לסקירה"}
              </button>
              {contractResult && (
                <div style={{
                  background: "#f9f9f9", border: "1px solid #e5e5e5", borderRadius: "12px",
                  padding: "12px", fontSize: "13px", lineHeight: "1.6",
                  textAlign: "right", direction: "rtl", whiteSpace: "pre-wrap",
                }}>
                  {contractResult}
                </div>
              )}
              <p style={{ fontSize: "11px", color: "#bbb", textAlign: "center", marginTop: "8px" }}>
                הקובץ לא נשמר ולא מועבר לאף גורם
              </p>
            </div>
          )}

          {/* Messages */}
          {tab === "chat" && <div style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {messages.length === 0 && (
              <div>
                <p style={{ fontSize: "13px", color: "#888", textAlign: "right", marginBottom: "12px" }}>שאלות נפוצות:</p>
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => sendMessage(s)}
                    style={{
                      display: "block", width: "100%", textAlign: "right",
                      background: "#fff8f3", border: "1px solid #fed7aa",
                      borderRadius: "10px", padding: "8px 12px", marginBottom: "6px",
                      fontSize: "13px", color: "#f97316", cursor: "pointer",
                      fontFamily: "Heebo, Arial, sans-serif",
                    }}>
                    {s}
                  </button>
                ))}
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                background: m.role === "user" ? "#f97316" : "#f5f5f5",
                color: m.role === "user" ? "white" : "#111",
                borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                padding: "10px 14px", maxWidth: "85%", fontSize: "13px",
                lineHeight: "1.5", textAlign: "right", direction: "rtl",
              }}>
                {m.content}
              </div>
            ))}
            {loading && (
              <div style={{
                alignSelf: "flex-start", background: "#f5f5f5",
                borderRadius: "16px 16px 16px 4px", padding: "10px 14px",
                fontSize: "13px", color: "#aaa",
              }}>
                {"מחשב..."}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          }

          {/* Input — chat tab only */}
          {tab === "chat" && <div style={{ padding: "12px", borderTop: "1px solid #f0f0f0", display: "flex", gap: "8px" }}>
            <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading}
              style={{
                background: "#f97316", color: "white", border: "none",
                borderRadius: "10px", padding: "8px 14px", cursor: "pointer",
                fontSize: "13px", opacity: (!input.trim() || loading) ? 0.4 : 1,
              }}>
              {"שלח"}
            </button>
            <input
              value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
              placeholder="שאל שאלה..."
              dir="rtl"
              style={{
                flex: 1, background: "#f5f5f5", border: "1px solid #e5e5e5",
                borderRadius: "10px", padding: "8px 12px", fontSize: "13px",
                fontFamily: "Heebo, Arial, sans-serif", outline: "none",
              }}
            />
          </div>

          }

          {/* Disclaimer */}
          <p style={{ fontSize: "10px", color: "#bbb", textAlign: "center", padding: "4px 12px 8px", margin: 0 }}>
            המידע הוא כללי ואינו תחליף לייעוץ משפטי מקצועי
          </p>
        </div>
      )}
    </>
  );
}
