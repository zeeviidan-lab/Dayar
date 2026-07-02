"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import StarRating from "./StarRating";

interface Props {
  onClose: () => void;
  onDone: () => void;
}

type Step = "address" | "rating" | "categories" | "details" | "verify" | "done";

const CATEGORIES = [
  { key: "rating_property", label: "הדירה" },
  { key: "rating_maintenance", label: "תחזוקה" },
  { key: "rating_building", label: "הבניין" },
  { key: "rating_landlord", label: "בעל הבית" },
  { key: "rating_neighbors", label: "שכנים" },
  { key: "rating_parking", label: "חניה" },
  { key: "rating_noise", label: "רעש" },
  { key: "rating_transport", label: "תחבורה ציבורית" },
  { key: "rating_shopping", label: "קניות" },
];

export default function NewReviewModal({ onClose, onDone }: Props) {
  const [step, setStep] = useState<Step>("address");
  const [address, setAddress] = useState("");
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<{ id: string; address: string; city: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [rating, setRating] = useState(0);
  const [catRatings, setCatRatings] = useState<Record<string, number>>({});
  const [hasStreetNum, setHasStreetNum] = useState(false);
  const [apartmentNumber, setApartmentNumber] = useState("");
  const [parsedAddr, setParsedAddr] = useState("");
  const [parsedCity, setParsedCity] = useState("");
  const [parsedLat, setParsedLat] = useState<number | null>(null);
  const [parsedLng, setParsedLng] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [rentAmount, setRentAmount] = useState("");
  const [rentYear, setRentYear] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const STEPS: Step[] = ["address", "rating", "categories", "details", "verify"];
  const stepIndex = STEPS.indexOf(step);

  useEffect(() => {
    if (step !== "address" || !inputRef.current) return;
    if (autocompleteRef.current) return;

    function initAuto() {
      if (!inputRef.current) return;
      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: "IL" },
        fields: ["formatted_address", "geometry", "address_components"],
        types: ["address"],
      });
      autocompleteRef.current.addListener("place_changed", async () => {
        const place = autocompleteRef.current!.getPlace();
        const fullAddress = place.formatted_address ?? "";
        const components = place.address_components ?? [];
        const cityComp = components.find((c: google.maps.GeocoderAddressComponent) =>
          c.types.includes("locality") || c.types.includes("administrative_area_level_2")
        );
        const city = cityComp?.long_name ?? "";
        const streetNum = components.find((c: google.maps.GeocoderAddressComponent) => c.types.includes("street_number"))?.long_name ?? "";
        const streetName = components.find((c: google.maps.GeocoderAddressComponent) => c.types.includes("route"))?.long_name ?? "";
        const addr = streetNum ? `${streetName} ${streetNum}` : streetName || fullAddress;
        setHasStreetNum(!!streetNum);
        const placeLat = place.geometry?.location?.lat() ?? null;
        const placeLng = place.geometry?.location?.lng() ?? null;
        setParsedAddr(addr);
        setParsedCity(city);
        setParsedLat(placeLat);
        setParsedLng(placeLng);
        setPropertyId(null);
        setAddress(`${addr}, ${city}`);
      });
    }

    if (window.google?.maps?.places) {
      initAuto();
    } else {
      const interval = setInterval(() => {
        if (window.google?.maps?.places) { clearInterval(interval); initAuto(); }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [step]);

  async function resolveProperty(apt: string) {
    if (!parsedAddr || !parsedCity || !apt.trim()) { setPropertyId(null); return; }
    const { data: existing } = await supabase.from("properties")
      .select("id").eq("address", parsedAddr).eq("city", parsedCity).eq("apartment_number", apt.trim()).maybeSingle();
    if (existing) {
      setPropertyId(existing.id);
    } else {
      const { data: created } = await supabase.from("properties")
        .insert({ address: parsedAddr, city: parsedCity, lat: parsedLat, lng: parsedLng, apartment_number: apt.trim() }).select().single();
      if (created) setPropertyId(created.id);
    }
  }

  async function searchProperties(q: string) {
    setSuggestions([]);
    if (q.length < 2) return;
    const { data } = await supabase.from("properties").select("id,address,city")
      .or(`address.ilike.%${q}%,city.ilike.%${q}%`).limit(5);
    setSuggestions(data ?? []);
  }

  async function selectProperty(id: string, addr: string, city: string) {
    setPropertyId(id);
    setAddress(`${addr}, ${city}`);
    setSuggestions([]);
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 3 - photos.length);
    setPhotos((prev) => [...prev, ...files].slice(0, 3));
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreviews((prev) => [...prev, ev.target?.result as string].slice(0, 3));
      reader.readAsDataURL(file);
    });
  }

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

  async function handleSubmit() {
    if (!propertyId) return;
    if (!agreedToTerms) { setError("יש לאשר את תנאי השימוש"); return; }
    setSubmitting(true); setError("");

    const { data: review, error: reviewError } = await supabase.from("reviews").insert({
      property_id: propertyId, rating,
      ...catRatings,
      text: text || null, is_anonymous: isAnonymous,
      is_verified: verified,
      verifier_email: verified ? email : null,
      rent_amount: rentAmount ? parseInt(rentAmount) : null,
      rent_year: rentYear ? parseInt(rentYear) : null,
    }).select().single();

    if (reviewError || !review) { setError("שגיאה בשמירה"); setSubmitting(false); return; }

    if (photos.length > 0) {
      const urls: string[] = [];
      for (const file of photos) {
        const ext = file.name.split(".").pop();
        const path = `${review.id}/${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from("review-photos").upload(path, file);
        if (!error) {
          const { data } = supabase.storage.from("review-photos").getPublicUrl(path);
          urls.push(data.publicUrl);
        }
      }
      if (urls.length > 0) await supabase.from("reviews").update({ photos: urls }).eq("id", review.id);
    }

    setSubmitting(false);
    setStep("done");
    setTimeout(onDone, 1500);
  }

  const RATINGS_LABELS = ["", "גרוע מאוד", "גרוע", "בינוני", "טוב", "מצוין"];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()} aria-hidden="true">
      <div role="dialog" aria-modal="true" aria-labelledby="new-review-modal-title" className="bg-white rounded-2xl w-full max-w-[560px] p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 id="new-review-modal-title" className="text-lg font-bold text-[#111]">{"ביקורת חדשה"}</h2>
          <button onClick={onClose} aria-label="סגור" className="text-[#aaa] hover:text-[#111] text-2xl leading-none">×</button>
        </div>

        {step !== "done" && (
          <div className="flex gap-1.5 mb-6">
            {STEPS.map((s, i) => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${i <= stepIndex ? "bg-[#f97316]" : "bg-[#e5e5e5]"}`} />
            ))}
          </div>
        )}

        {/* Step 1: Address */}
        {step === "address" && (
          <div className="space-y-3">
            <p className="text-sm text-[#666]">{"הזן את כתובת הנכס"}</p>
            <input ref={inputRef} type="text" placeholder="רחוב ומספר, עיר..." dir="rtl"
              className="w-full bg-[#f5f5f5] border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#f97316] transition-colors" />
            {address && hasStreetNum && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-2 text-sm text-[#f97316] font-medium">
                {"✓ "}{address}
              </div>
            )}
            {address && !hasStreetNum && (
              <p className="text-red-500 text-xs">{"יש לבחור כתובת עם מספר בניין"}</p>
            )}
            {address && hasStreetNum && (
              <div>
                <p className="text-sm text-[#666] mb-1">{"מספר דירה"}</p>
                <input
                  value={apartmentNumber}
                  onChange={(e) => {
                    setApartmentNumber(e.target.value);
                    resolveProperty(e.target.value);
                  }}
                  placeholder="לדוגמה: 4"
                  type="text" dir="ltr"
                  className="w-full bg-[#f5f5f5] border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#f97316] transition-colors"
                />
              </div>
            )}
          </div>
        )}

        {/* Step 2: Overall rating */}
        {step === "rating" && (
          <div className="text-center space-y-4">
            <p className="text-[#666]">{"איך הייתה החוויה הכללית?"}</p>
            <StarRating rating={rating} size="lg" interactive onRate={setRating} />
            <p className="text-[#aaa] text-sm">{rating === 0 ? "בחר דירוג" : RATINGS_LABELS[rating]}</p>
          </div>
        )}

        {/* Step 3: Category ratings */}
        {step === "categories" && (
          <div>
            <p className="text-sm text-[#666] mb-4">{"דרג לפי קטגוריה (אופציונלי)"}</p>
            <div className="space-y-3">
              {CATEGORIES.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <StarRating rating={catRatings[key] ?? 0} size="sm" interactive onRate={(v) => setCatRatings((p) => ({ ...p, [key]: v }))} />
                  <span className="text-sm text-[#555]">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Details */}
        {step === "details" && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-[#666] mb-2">{"שכירות חודשית (₪) — אופציונלי"}</p>
              <div className="flex gap-2">
                <input value={rentAmount} onChange={(e) => setRentAmount(e.target.value.replace(/\D/g, ""))}
                  placeholder="לדוגמה: 4500" type="text" inputMode="numeric" dir="ltr"
                  className="flex-1 bg-[#f5f5f5] border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#f97316] transition-colors" />
                <input value={rentYear} onChange={(e) => setRentYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="שנה" type="text" inputMode="numeric" dir="ltr"
                  className="w-24 bg-[#f5f5f5] border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#f97316] transition-colors" />
              </div>
            </div>
            <textarea value={text} onChange={(e) => setText(e.target.value)}
              placeholder="שתף את החוויה שלך (אופציונלי)..." rows={4} dir="rtl"
              className="w-full bg-[#f5f5f5] border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#f97316] transition-colors resize-none" />
            <div>
              <p className="text-sm text-[#666] mb-2">{"תמונות (עד 3)"}</p>
              <div className="flex gap-2 flex-wrap">
                {photoPreviews.map((src, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#e5e5e5]">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => { setPhotos((p) => p.filter((_, idx) => idx !== i)); setPhotoPreviews((p) => p.filter((_, idx) => idx !== i)); }}
                      className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">×</button>
                  </div>
                ))}
                {photos.length < 3 && (
                  <button onClick={() => fileInputRef.current?.click()}
                    className="w-16 h-16 rounded-xl border-2 border-dashed border-[#e5e5e5] flex flex-col items-center justify-center text-[#bbb] hover:border-[#f97316] hover:text-[#f97316] transition-colors text-xs">
                    <span className="text-xl leading-none">+</span>
                  </button>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoChange} />
            </div>
            <div className="bg-[#fff8f3] border border-orange-100 rounded-xl p-3 text-xs text-[#888] leading-relaxed" dir="rtl">
              {"דַּיָּר מאמינה בחופש הביטוי ובשקיפות. אנא שתף את חוויותיך באופן כן, מכבד ועניני. ביקורות הכוללות תוכן פוגעני, לשון הרע או שפה בוטה יוסרו."}
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
          </div>
        )}

        {/* Step 5: Verify */}
        {step === "verify" && (
          <div className="space-y-4">
            {!verified ? (
              <>
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-[#f97316] mb-1">{"אימות ביקורת"}</p>
                  <p className="text-xs text-[#888]">{"אמת את הביקורת עם האימייל שלך כדי לקבל תג ✓ מאומת. הכתובת לא תוצג פומבית."}</p>
                </div>
                {!codeSent ? (
                  <div className="space-y-2">
                    <input value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="האימייל שלך" type="email" dir="ltr"
                      className="w-full bg-[#f5f5f5] border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#f97316] transition-colors" />
                    <button onClick={sendCode} disabled={submitting || !email}
                      className="w-full py-2.5 bg-[#f97316] text-white rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-[#fb923c] transition-colors">
                      {submitting ? "שולח..." : "שלח קוד אימות"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-[#666]">{"הכנס את הקוד שנשלח ל-"}{email}</p>
                    <input value={code} onChange={(e) => setCode(e.target.value)}
                      placeholder="123456" maxLength={6} dir="ltr"
                      className="w-full bg-[#f5f5f5] border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm text-center tracking-widest focus:outline-none focus:border-[#f97316] transition-colors" />
                    <button onClick={verifyCode} disabled={submitting || code.length !== 6}
                      className="w-full py-2.5 bg-[#f97316] text-white rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-[#fb923c] transition-colors">
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
                <p className="text-xs text-[#aaa] mt-1">{"הביקורת שלך תסומן כמאומתת"}</p>
              </div>
            )}
          </div>
        )}

        {step === "done" && (
          <div className="text-center py-8">
            <div className="text-5xl mb-3">🎉</div>
            <p className="font-bold text-[#111]">{"הביקורת פורסמה!"}</p>
            {verified && <p className="text-sm text-green-600 mt-1">{"✓ הביקורת מאומתת"}</p>}
            <p className="text-sm text-[#888] mt-3 mb-4">{"עזור לשכנים שלך — שתף את הדף"}</p>
            <button
              onClick={async () => {
                const url = `${window.location.origin}/property/${propertyId}`;
                const text = `ביקורות על ${address} — דַּיָּר`;
                if (navigator.share) {
                  try { await navigator.share({ title: text, url }); return; } catch {}
                }
                await navigator.clipboard.writeText(url);
                alert("הלינק הועתק!");
              }}
              className="px-6 py-2.5 rounded-xl bg-[#f97316] text-white font-bold text-sm hover:bg-[#fb923c] transition-colors"
            >
              {"🔗 שתף את הדף"}
            </button>
          </div>
        )}

        {step !== "done" && (
          <div className="flex gap-3 mt-6 w-full">
            {stepIndex > 0 && (
              <button onClick={() => setStep(STEPS[stepIndex - 1])}
                style={{ display: "flex", flex: 1, justifyContent: "center", textAlign: "center" }}
                className="py-3 rounded-xl border border-[#e5e5e5] text-[#666] hover:border-[#ccc] transition-colors text-sm">
                {"חזור"}
              </button>
            )}
            {step === "address" && (
              <button onClick={() => setStep("rating")} disabled={!propertyId || !hasStreetNum || !apartmentNumber.trim()}
                style={{ display: "flex", flex: 1, justifyContent: "center", textAlign: "center" }}
                className="py-3 rounded-xl bg-[#f97316] text-white font-bold disabled:opacity-30 hover:bg-[#fb923c] transition-colors text-sm">
                {"המשך"}
              </button>
            )}
            {step === "rating" && (
              <button onClick={() => setStep("categories")} disabled={rating === 0}
                style={{ display: "flex", flex: 1, justifyContent: "center", textAlign: "center" }}
                className="py-3 rounded-xl bg-[#f97316] text-white font-bold disabled:opacity-30 hover:bg-[#fb923c] transition-colors text-sm">
                {"המשך"}
              </button>
            )}
            {step === "categories" && (
              <button onClick={() => setStep("details")}
                style={{ display: "flex", flex: 1, justifyContent: "center", textAlign: "center" }}
                className="py-3 rounded-xl bg-[#f97316] text-white font-bold hover:bg-[#fb923c] transition-colors text-sm">
                {"המשך"}
              </button>
            )}
            {step === "details" && (
              <button onClick={() => { if (!agreedToTerms) { setError("יש לאשר את תנאי השימוש"); return; } setError(""); setStep("verify"); }}
                style={{ display: "flex", flex: 1, justifyContent: "center", textAlign: "center" }}
                className="py-3 rounded-xl bg-[#f97316] text-white font-bold hover:bg-[#fb923c] transition-colors text-sm">
                {"המשך"}
              </button>
            )}
            {step === "verify" && (
              <button onClick={handleSubmit} disabled={submitting || !verified}
                style={{ display: "flex", flex: 1, justifyContent: "center", textAlign: "center" }}
                className="py-3 rounded-xl bg-[#f97316] text-white font-bold disabled:opacity-50 hover:bg-[#fb923c] transition-colors text-sm">
                {submitting ? "שולח..." : verified ? "פרסם ביקורת" : "יש לאמת אימייל תחילה"}
              </button>
            )}
          </div>
        )}
        {error && step !== "verify" && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
    </div>
  );
}
