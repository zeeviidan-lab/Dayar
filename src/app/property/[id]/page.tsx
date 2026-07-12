"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase, Property, Review } from "@/lib/supabase";
import StarRating from "@/components/StarRating";
import NewReviewModal from "@/components/NewReviewModal";
import { TAG_COLOR_CLASSES, getTagColor } from "@/lib/tags";

const TENANT_RIGHTS = [
  { title: "פיקדון מוגבל ל-3 חודשים", desc: "לפי חוק שכירות הוגנת 2017, המשכיר אינו רשאי לדרוש פיקדון העולה על 3 חודשי שכירות.", icon: "🔐" },
  { title: "החזרת פיקדון תוך 60 יום", desc: "המשכיר חייב להחזיר את הפיקדון תוך 60 יום מסיום השכירות, בניכוי נזקים מוכחים בלבד.", icon: "📅" },
  { title: "חובת גילוי ליקויים", desc: "על המשכיר לגלות לדייר כל ליקוי מהותי ידוע בנכס לפני כריתת החוזה.", icon: "📋" },
  { title: "איסור כניסה ללא תיאום", desc: "המשכיר אינו רשאי להיכנס לדירה ללא הסכמת הדייר מראש ובכתב, אלא במקרי חירום.", icon: "🚪" },
];

type SubRatingKey = "rating_maintenance" | "rating_landlord" | "rating_neighbors" | "rating_parking" | "rating_noise";
const SUB_RATINGS: { key: SubRatingKey; label: string }[] = [
  { key: "rating_maintenance", label: "תחזוקה" },
  { key: "rating_landlord", label: "משכיר" },
  { key: "rating_neighbors", label: "שכנים" },
  { key: "rating_parking", label: "חניה" },
  { key: "rating_noise", label: "רעש" },
];

function avg(arr: number[]) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export default function PropertyPage() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"reviews" | "rights">("reviews");
  const [showModal, setShowModal] = useState(false);
  const [reported, setReported] = useState<Set<string>>(new Set());
  const [nearbyProps, setNearbyProps] = useState<Property[]>([]);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");
  const [responses, setResponses] = useState<Record<string, { text: string; created_at: string }[]>>({});
  const [submittingResponse, setSubmittingResponse] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  async function loadData() {
    const [{ data: prop }, { data: revs }] = await Promise.all([
      supabase.from("properties").select("*").eq("id", id).single(),
      supabase.from("reviews").select("*").eq("property_id", id).order("created_at", { ascending: false }),
    ]);
    if (prop) setProperty(prop);
    if (revs) {
      const withTags = await Promise.all(revs.map(async (r) => {
        const { data: tags } = await supabase.from("review_tags").select("tag").eq("review_id", r.id);
        return { ...r, tags: tags?.map((t) => t.tag) ?? [] };
      }));
      setReviews(withTags);

      // load landlord responses
      const reviewIds = revs.map((r) => r.id);
      if (reviewIds.length > 0) {
        const { data: resps } = await supabase
          .from("landlord_responses")
          .select("*")
          .in("review_id", reviewIds);
        if (resps) {
          const grouped: Record<string, { text: string; created_at: string }[]> = {};
          resps.forEach((resp) => {
            if (!grouped[resp.review_id]) grouped[resp.review_id] = [];
            grouped[resp.review_id].push({ text: resp.text, created_at: resp.created_at });
          });
          setResponses(grouped);
        }
      }

      // if no reviews, find nearby properties on same street or city
      if (revs.length === 0 && prop) {
        const { data: allProps } = await supabase
          .from("properties")
          .select("*")
          .neq("id", prop.id);
        if (allProps) {
          const streetWord = prop.address.split(" ").find((w: string) => w.length > 2) ?? "";
          const withCounts = await Promise.all(allProps.map(async (p: Property) => {
            const { count } = await supabase
              .from("reviews")
              .select("*", { count: "exact", head: true })
              .eq("property_id", p.id);
            return { ...p, review_count: count ?? 0 };
          }));
          // prefer same street, fallback to same city
          const sameStreet = withCounts.filter(
            (p) => p.address.includes(streetWord) && (p.review_count ?? 0) > 0
          );
          const sameCity = withCounts.filter(
            (p) => p.city === prop.city && (p.review_count ?? 0) > 0
          );
          setNearbyProps(sameStreet.length > 0 ? sameStreet : sameCity.slice(0, 3));
        }
      }
    }
    setLoading(false);
  }

  useEffect(() => { loadData(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

  async function submitResponse(reviewId: string) {
    if (!responseText.trim()) return;
    setSubmittingResponse(true);
    await supabase.from("landlord_responses").insert({ review_id: reviewId, text: responseText.trim() });
    setResponses((prev) => ({
      ...prev,
      [reviewId]: [...(prev[reviewId] ?? []), { text: responseText.trim(), created_at: new Date().toISOString() }],
    }));
    setResponseText("");
    setRespondingTo(null);
    setSubmittingResponse(false);
  }

  const overallAvg = avg(reviews.map((r) => r.rating));
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [copied, setCopied] = useState(false);
  async function handleShare() {
    const url = window.location.href;
    const text = property ? `ביקורות על ${property.address}, ${property.city} — דַּיָּר` : "דַּיָּר";
    if (navigator.share) {
      try { await navigator.share({ title: text, url }); return; } catch {}
    }
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (loading) return <main className="py-8 text-center text-[#aaa]">{"טוען..."}</main>;
  if (!property) return (
    <main className="py-8 text-center text-[#aaa]">
      <p>{"נכס לא נמצא"}</p>
      <Link href="/" className="text-[#C25E3A] mt-4 inline-block">{"חזרה לדף הבית"}</Link>
    </main>
  );

  return (
    <main className="py-6">
      <div className="flex justify-between items-center mb-4">
        <Link href="/" className="text-[#C25E3A] text-sm">{"← חזרה"}</Link>
        <button onClick={handleShare}
          className="flex items-center gap-1.5 text-sm text-[#666] hover:text-[#C25E3A] transition-colors border border-[#e5e5e5] rounded-lg px-3 py-1.5">
          {copied ? "✓ הועתק!" : "🔗 שתף"}
        </button>
      </div>

      <div className="bg-white border border-[#e5e5e5] rounded-2xl p-5 mb-4 shadow-sm">
        <h1 className="text-xl font-bold text-[#111]">{property.address}</h1>
        <p className="text-[#666] mt-1">{property.city}</p>
        {property.landlord_name && <p className="text-sm text-[#999] mt-1">{"משכיר: "}{property.landlord_name}</p>}

        <div className="flex items-center gap-3 mt-4">
          <StarRating rating={overallAvg} size="md" />
          <span className="text-2xl font-black text-[#C25E3A]">{overallAvg > 0 ? overallAvg.toFixed(1) : "—"}</span>
          <span className="text-[#aaa] text-sm">{"("}{reviews.length}{" ביקורות)"}</span>
        </div>

        {reviews.length > 0 && (
          <div className="mt-4 space-y-2">
            {SUB_RATINGS.map(({ key, label }) => {
              const a = avg(reviews.map((r) => r[key] ?? 0));
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-sm text-[#666] w-20 shrink-0">{label}</span>
                  <div className="flex-1 bg-[#f5f5f5] rounded-full h-2">
                    <div className="bg-[#C25E3A] h-2 rounded-full transition-all" style={{ width: `${(a / 5) * 100}%` }} />
                  </div>
                  <span className="text-xs text-[#aaa] w-6 text-left">{a.toFixed(1)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {apiKey && property.lat && property.lng && (
        <div className="mb-4">
          <div className="rounded-2xl overflow-hidden h-48">
            <iframe title="מיקום הנכס" width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen
              src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${property.lat},${property.lng}&zoom=16&language=he`} />
          </div>
        </div>
      )}

      <div className="bg-[#FAF5F0] border border-[#EBD5C8] rounded-xl p-3 mb-4 text-xs text-[#888]">
        {"⚠️ הביקורות מייצגות חוויות אישיות של משתמשים בלבד ואינן מהוות עמדת הפלטפורמה."}
      </div>

      <button onClick={() => setShowModal(true)}
        className="w-full py-3 rounded-xl bg-[#C25E3A] text-white font-bold text-base hover:bg-[#A94F2E] transition-colors mb-2">
        {"+ כתוב ביקורת"}
      </button>
      <p className="text-center text-xs text-[#999] mb-6">{"🏠 שוקל לקנות את הנכס? קרא מה הדיירים אומרים"}</p>

      <div className="flex border-b border-[#e5e5e5] mb-4">
        {(["reviews", "rights"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${tab === t ? "text-[#C25E3A] border-b-2 border-[#C25E3A]" : "text-[#aaa] hover:text-[#666]"}`}>
            {t === "reviews" ? "ביקורות" : "זכויות דייר"}
          </button>
        ))}
      </div>

      {tab === "reviews" && (
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="py-4">
              <p className="text-center text-[#aaa] mb-6">{"אין ביקורות עדיין. היה הראשון!"}</p>
              {nearbyProps.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-[#666] mb-3">
                    {nearbyProps[0].address.includes(property.address.split(" ").find((w) => w.length > 2) ?? "")
                      ? "ביקורות מאותו רחוב"
                      : "ביקורות מאותה עיר"}
                  </p>
                  <div className="space-y-2">
                    {nearbyProps.map((p) => (
                      <Link key={p.id} href={`/property/${p.id}`}>
                        <div className="border border-[#e5e5e5] rounded-xl p-3 hover:border-[#C25E3A]/40 hover:shadow-sm transition-all">
                          <p className="font-medium text-[#111] text-sm">{p.address}</p>
                          <p className="text-xs text-[#999]">{p.city} · {p.review_count} ביקורות</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : reviews.map((r) => (
            <div key={r.id} className="bg-white border border-[#e5e5e5] rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <StarRating rating={r.rating} size="sm" />
                  {r.is_verified && (
                    <span className="text-xs bg-green-50 text-green-600 border border-green-200 px-2 py-0.5 rounded-full">{"✓ מאומת"}</span>
                  )}
                </div>
                <span className="text-xs text-[#bbb]">{new Date(r.created_at).toLocaleDateString("he-IL")}</span>
              </div>
              {r.tags && r.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {r.tags.map((tag) => (
                    <span key={tag} className={`px-2 py-0.5 rounded-full text-xs border ${TAG_COLOR_CLASSES[getTagColor(tag)]}`}>{tag}</span>
                  ))}
                </div>
              )}
              {r.text && <p className="text-sm text-[#555] leading-relaxed">{r.text}</p>}
              {r.photos && r.photos.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {r.photos.map((url: string, i: number) => (
                    <button key={i} type="button" onClick={() => setLightboxUrl(url)} aria-label="הגדל תמונה"
                      className="min-w-0 min-h-0 p-0 border-0 bg-transparent cursor-pointer">
                      <img src={url} alt="" className="w-20 h-20 object-cover rounded-xl border border-[#e5e5e5] hover:opacity-90 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}
              <div className="flex justify-between items-center mt-3">
                <span className="text-xs text-[#bbb]">{r.is_anonymous ? "אנונימי" : "משתמש רשום"}</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => setReported((prev) => new Set([...prev, r.id]))}
                    className="text-xs text-[#ddd] hover:text-red-400 transition-colors">
                    {reported.has(r.id) ? "✓ דווח" : "דווח"}
                  </button>
                </div>
              </div>

              {/* Landlord responses */}
              {(responses[r.id] ?? []).map((resp, i) => (
                <div key={i} className="mt-3 bg-[#FAF5F0] border border-[#EBD5C8] rounded-xl p-3">
                  <p className="text-xs font-bold text-[#C25E3A] mb-1">{"תגובת משכיר"}</p>
                  <p className="text-sm text-[#555]">{resp.text}</p>
                  <p className="text-xs text-[#bbb] mt-1">{new Date(resp.created_at).toLocaleDateString("he-IL")}</p>
                </div>
              ))}

              {respondingTo === r.id ? (
                <div className="mt-3 space-y-2">
                  <textarea value={responseText} onChange={(e) => setResponseText(e.target.value)}
                    placeholder="כתוב תגובה כמשכיר..." rows={3} dir="rtl"
                    className="w-full bg-[#f5f5f5] border border-[#e5e5e5] rounded-xl px-3 py-2 text-sm text-[#111] placeholder-[#aaa] focus:outline-none focus:border-[#C25E3A] transition-colors resize-none" />
                  <div className="flex gap-2">
                    <button onClick={() => submitResponse(r.id)} disabled={submittingResponse || !responseText.trim()}
                      className="px-4 py-2 bg-[#C25E3A] text-white text-sm rounded-lg hover:bg-[#A94F2E] disabled:opacity-40 transition-colors">
                      {submittingResponse ? "שולח..." : "פרסם"}
                    </button>
                    <button onClick={() => { setRespondingTo(null); setResponseText(""); }}
                      className="px-4 py-2 border border-[#e5e5e5] text-sm text-[#666] rounded-lg hover:border-[#ccc] transition-colors">
                      {"ביטול"}
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => { setRespondingTo(r.id); setResponseText(""); }}
                  className="mt-2 text-xs text-[#bbb] hover:text-[#C25E3A] transition-colors">
                  {"↩ השב כמשכיר"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "rights" && (
        <div className="space-y-3">
          {TENANT_RIGHTS.map((right) => (
            <div key={right.title} className="bg-white border border-[#e5e5e5] rounded-xl p-4 shadow-sm">
              <div className="flex gap-3">
                <span className="text-2xl">{right.icon}</span>
                <div>
                  <h3 className="font-semibold text-[#111] mb-1">{right.title}</h3>
                  <p className="text-sm text-[#777] leading-relaxed">{right.desc}</p>
                </div>
              </div>
            </div>
          ))}
          <p className="text-xs text-[#bbb] text-center py-2">{"מבוסס על חוק שכירות הוגנת 2017"}</p>
        </div>
      )}

      {showModal && <NewReviewModal existingPropertyId={property.id} onClose={() => setShowModal(false)} onPublished={() => { setShowModal(false); loadData(); }} />}

      {/* Photo lightbox — closes on ✕ or tap anywhere */}
      {lightboxUrl && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}>
          <button type="button" aria-label="סגור תמונה" onClick={() => setLightboxUrl(null)}
            className="absolute top-4 left-4 w-11 h-11 rounded-full bg-white/15 text-white text-2xl flex items-center justify-center hover:bg-white/30 transition-colors">
            ✕
          </button>
          <img src={lightboxUrl} alt="" className="max-w-full max-h-[85vh] object-contain rounded-xl" />
        </div>
      )}
    </main>
  );
}
