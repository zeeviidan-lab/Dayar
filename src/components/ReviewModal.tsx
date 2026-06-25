"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { TAGS, TAG_COLOR_CLASSES } from "@/lib/tags";
import StarRating from "./StarRating";

interface Props {
  propertyId: string;
  onClose: () => void;
  onDone: () => void;
}

export default function ReviewModal({ propertyId, onClose, onDone }: Props) {
  const [step, setStep] = useState(1);
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [verified, setVerified] = useState(false);

  async function sendCode() {
    if (!email.includes("@")) { setError("אימייל לא תקין"); return; }
    setSubmitting(true); setError("");
    const res = await fetch("/api/send-verification", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setSubmitting(false);
    if (res.ok) setCodeSent(true);
    else setError("שגיאה בשליחת אימייל");
  }

  async function verifyCode() {
    setSubmitting(true); setError("");
    const res = await fetch("/api/verify-code", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    setSubmitting(false);
    if (res.ok) setVerified(true);
    else setError("קוד שגוי או פג תוקף");
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 3 - photos.length);
    if (!files.length) return;
    setPhotos((prev) => [...prev, ...files].slice(0, 3));
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreviews((prev) => [...prev, ev.target?.result as string].slice(0, 3));
      reader.readAsDataURL(file);
    });
  }

  function removePhoto(i: number) {
    setPhotos((prev) => prev.filter((_, idx) => idx !== i));
    setPhotoPreviews((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function uploadPhotos(reviewId: string): Promise<string[]> {
    const urls: string[] = [];
    for (const file of photos) {
      const ext = file.name.split(".").pop();
      const path = `${reviewId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("review-photos").upload(path, file);
      if (!error) {
        const { data } = supabase.storage.from("review-photos").getPublicUrl(path);
        urls.push(data.publicUrl);
      }
    }
    return urls;
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    const { data: review, error: reviewError } = await supabase
      .from("reviews")
      .insert({ property_id: propertyId, rating, rating_maintenance: rating, rating_landlord: rating, rating_neighbors: rating, rating_parking: rating, rating_noise: rating, text: text || null, is_anonymous: isAnonymous, is_verified: verified })
      .select().single();
    if (reviewError || !review) { setError("שגיאה בשמירת הביקורת. נסה שוב."); setSubmitting(false); return; }
    if (selectedTags.length > 0) {
      await supabase.from("review_tags").insert(selectedTags.map((tag) => ({ review_id: review.id, tag })));
    }
    if (photos.length > 0) {
      const photoUrls = await uploadPhotos(review.id);
      if (photoUrls.length > 0) {
        await supabase.from("reviews").update({ photos: photoUrls }).eq("id", review.id);
      }
    }
    setSubmitting(false);
    onDone();
  }

  const RATINGS_LABELS = ["", "גרוע מאוד", "גרוע", "בינוני", "טוב", "מצוין"];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white border border-[#e5e5e5] rounded-2xl w-full max-w-[560px] p-6 mb-4 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-[#111]">{"כתוב ביקורת"}</h2>
          <button onClick={onClose} className="text-[#aaa] hover:text-[#111] text-2xl leading-none">×</button>
        </div>

        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? "bg-[#f97316]" : "bg-[#e5e5e5]"}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="text-center">
            <p className="text-[#666] mb-6">{"איך הייתה החוויה שלך?"}</p>
            <StarRating rating={rating} size="lg" interactive onRate={setRating} />
            <p className="text-[#aaa] text-sm mt-4">{rating === 0 ? "בחר דירוג" : RATINGS_LABELS[rating]}</p>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="text-[#666] mb-4 text-sm">{"בחר תגיות (אפשר כמה)"}</p>
            <div className="flex flex-wrap gap-2">
              {TAGS.map(({ label, color }) => (
                <button key={label} onClick={() => toggleTag(label)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-all ${selectedTags.includes(label) ? TAG_COLOR_CLASSES[color] + " scale-105" : "border-[#e5e5e5] text-[#666] hover:border-[#ccc]"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="שתף את החוויה שלך (אופציונלי)..." rows={3}
              className="w-full bg-[#f5f5f5] border border-[#e5e5e5] rounded-xl px-4 py-3 text-[#111] placeholder-[#aaa] focus:outline-none focus:border-[#f97316] transition-colors resize-none text-right" dir="rtl" />

            {/* Photo upload */}
            <div>
              <p className="text-sm text-[#666] mb-2">{"תמונות (עד 3)"}</p>
              <div className="flex gap-2 flex-wrap">
                {photoPreviews.map((src, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#e5e5e5]">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => removePhoto(i)}
                      className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs leading-none">
                      ×
                    </button>
                  </div>
                ))}
                {photos.length < 3 && (
                  <button onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-xl border-2 border-dashed border-[#e5e5e5] flex flex-col items-center justify-center text-[#bbb] hover:border-[#f97316] hover:text-[#f97316] transition-colors text-xs gap-1">
                    <span className="text-2xl leading-none">+</span>
                    <span>{"הוסף"}</span>
                  </button>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoChange} />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="accent-[#f97316]" />
              <span className="text-sm text-[#666]">{"פרסם באנונימיות"}</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="accent-[#f97316]" />
              <span className="text-sm text-[#666]">{"אני מסכים/ה ל"}
                <a href="/terms" target="_blank" className="text-[#f97316] underline mr-1">{"תנאי השימוש"}</a>
              </span>
            </label>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <p className="text-xs text-[#bbb]">{"הביקורת מייצגת חוויה אישית בלבד ואינה מהווה עמדה של הפלטפורמה."}</p>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            {!verified ? (
              <>
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-[#f97316] mb-1">{"אימות ביקורת (אופציונלי)"}</p>
                  <p className="text-xs text-[#888]">{"אמת את הביקורת עם האימייל שלך כדי לקבל תג ✓ מאומת."}</p>
                </div>
                {!codeSent ? (
                  <div className="space-y-2">
                    <input value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="האימייל שלך" type="email" dir="ltr"
                      className="w-full bg-[#f5f5f5] border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#f97316]" />
                    <button onClick={sendCode} disabled={submitting || !email}
                      className="w-full py-2.5 bg-[#f97316] text-white rounded-xl text-sm font-medium disabled:opacity-40">
                      {submitting ? "שולח..." : "שלח קוד אימות"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-[#666]">{"הכנס את הקוד שנשלח ל-"}{email}</p>
                    <input value={code} onChange={(e) => setCode(e.target.value)}
                      placeholder="123456" maxLength={6} dir="ltr"
                      className="w-full bg-[#f5f5f5] border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm text-center tracking-widest focus:outline-none focus:border-[#f97316]" />
                    <button onClick={verifyCode} disabled={submitting || code.length !== 6}
                      className="w-full py-2.5 bg-[#f97316] text-white rounded-xl text-sm font-medium disabled:opacity-40">
                      {submitting ? "מאמת..." : "אמת קוד"}
                    </button>
                  </div>
                )}
                {error && <p className="text-red-500 text-sm">{error}</p>}
              </>
            ) : (
              <div className="text-center py-4">
                <div className="text-4xl mb-2">✅</div>
                <p className="text-sm font-semibold text-green-600">{"אימייל אומת בהצלחה!"}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 mt-6 w-full">
          {step > 1 && (
            <button onClick={() => setStep((s) => s - 1)} style={{ display: "flex", flex: 1, justifyContent: "center" }}
              className="py-3 rounded-xl border border-[#e5e5e5] text-[#666] hover:border-[#ccc] transition-colors">
              {"חזור"}
            </button>
          )}
          {step < 4 ? (
            <button onClick={() => { if (step === 3 && !agreedToTerms) { setError("יש לאשר את תנאי השימוש"); return; } setError(""); setStep((s) => s + 1); }} disabled={step === 1 && rating === 0}
              style={{ display: "flex", flex: 1, justifyContent: "center" }}
              className="py-3 rounded-xl bg-[#f97316] text-white font-bold hover:bg-[#fb923c] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              {"המשך"}
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}
              style={{ display: "flex", flex: 1, justifyContent: "center" }}
              className="py-3 rounded-xl bg-[#f97316] text-white font-bold hover:bg-[#fb923c] disabled:opacity-50 transition-colors">
              {submitting ? "שולח..." : "פרסם ביקורת"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
