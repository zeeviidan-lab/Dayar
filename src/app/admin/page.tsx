"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, Property } from "@/lib/supabase";

interface AdminReview {
  id: string;
  property_id: string;
  rating: number;
  text: string | null;
  is_verified: boolean;
  created_at: string;
}

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [properties, setProperties] = useState<Property[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(false);

  // Restore the key for the duration of the browser session
  useEffect(() => {
    const saved = sessionStorage.getItem("dayar_admin_key");
    if (saved) { setKey(saved); unlock(saved); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function unlock(candidate: string) {
    if (!candidate.trim() || checking) return;
    setChecking(true); setError("");
    const res = await fetch("/api/admin-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "verify", adminKey: candidate }),
    });
    setChecking(false);
    if (res.ok) {
      sessionStorage.setItem("dayar_admin_key", candidate);
      setUnlocked(true);
      loadData();
    } else {
      sessionStorage.removeItem("dayar_admin_key");
      setError("מפתח שגוי");
    }
  }

  async function loadData() {
    setLoading(true);
    const [{ data: props }, { data: revs }] = await Promise.all([
      supabase.from("properties").select("*").order("created_at", { ascending: false }),
      supabase.from("reviews").select("id,property_id,rating,text,is_verified,created_at").order("created_at", { ascending: false }),
    ]);
    setProperties(props ?? []);
    setReviews((revs as AdminReview[]) ?? []);
    setLoading(false);
  }

  async function downloadBackup() {
    const res = await fetch("/api/admin-export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminKey: key }),
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dayar-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function deleteReview(id: string) {
    if (!window.confirm("למחוק את הביקורת לצמיתות?")) return;
    const res = await fetch("/api/admin-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "review", id, adminKey: key }),
    });
    if (res.ok) setReviews((prev) => prev.filter((r) => r.id !== id));
  }

  async function deleteProperty(id: string) {
    if (!window.confirm("למחוק את הנכס וכל הביקורות שלו לצמיתות?")) return;
    const res = await fetch("/api/admin-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "property", id, adminKey: key }),
    });
    if (res.ok) {
      setProperties((prev) => prev.filter((p) => p.id !== id));
      setReviews((prev) => prev.filter((r) => r.property_id !== id));
    }
  }

  if (!unlocked) {
    return (
      <main className="py-16 max-w-sm mx-auto text-center">
        <h1 className="text-lg font-bold mb-4">{"ניהול דַּיָּר"}</h1>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") unlock(key); }}
          placeholder="מפתח ניהול"
          dir="ltr"
          className="w-full bg-white border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm text-center focus:outline-none focus:border-[#C25E3A] mb-3"
        />
        <button onClick={() => unlock(key)} disabled={checking}
          className="w-full py-3 rounded-xl bg-[#C25E3A] text-white font-bold text-sm disabled:opacity-50 hover:bg-[#A94F2E] transition-colors">
          {checking ? "בודק..." : "כניסה"}
        </button>
        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
      </main>
    );
  }

  return (
    <main className="py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold">{"ניהול דַּיָּר"}</h1>
        <div className="flex items-center gap-3">
          <button onClick={downloadBackup}
            className="text-xs px-3 py-1.5 rounded-lg border border-[#e5e5e5] text-[#666] hover:border-[#C25E3A] hover:text-[#C25E3A] transition-colors">
            {"⬇ הורד גיבוי"}
          </button>
          <span className="text-xs text-[#C25E3A] font-medium">{"אדמין ✓"}</span>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-[#aaa] py-12">{"טוען..."}</p>
      ) : (
        <div className="space-y-4">
          {properties.map((p) => {
            const propReviews = reviews.filter((r) => r.property_id === p.id);
            const isDup = properties.filter((q) => q.address === p.address && q.city === p.city).length > 1;
            return (
              <div key={p.id} className={`bg-white border rounded-xl p-4 ${isDup ? "border-amber-300 bg-amber-50/40" : "border-[#e5e5e5]"}`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Link href={`/property/${p.id}`} className="font-bold text-sm hover:text-[#C25E3A]">
                      {p.address}{", "}{p.city}
                    </Link>
                    <p className="text-xs text-[#aaa] mt-0.5">
                      {propReviews.length}{" ביקורות"}
                      {p.apartment_number ? ` · דירה ${p.apartment_number}` : " · ללא מס' דירה"}
                      {` · ${new Date(p.created_at).toLocaleDateString("he-IL")}`}
                      {isDup && <span className="text-amber-600 font-medium">{" · ⚠ כתובת כפולה"}</span>}
                    </p>
                  </div>
                  <button onClick={() => deleteProperty(p.id)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors shrink-0">
                    {"מחק נכס"}
                  </button>
                </div>

                {propReviews.length > 0 && (
                  <div className="mt-3 space-y-2 border-t border-[#f0f0f0] pt-3">
                    {propReviews.map((r) => (
                      <div key={r.id} className="flex items-center justify-between gap-3 text-sm">
                        <div className="min-w-0">
                          <span className="text-[#C25E3A]">{"★".repeat(r.rating)}</span>
                          {r.is_verified && <span className="text-green-600 text-xs mr-1">{"✓"}</span>}
                          <span className="text-[#666] text-xs mr-2">
                            {new Date(r.created_at).toLocaleDateString("he-IL")}
                          </span>
                          <p className="text-[#555] text-xs truncate">{r.text ?? "(ללא טקסט)"}</p>
                        </div>
                        <button onClick={() => deleteReview(r.id)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors shrink-0">
                          {"מחק"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
