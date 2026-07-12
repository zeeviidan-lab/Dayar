"use client";

import { useEffect, useState, useCallback, useMemo, Fragment, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase, Property } from "@/lib/supabase";
import SmartSearch from "@/components/SmartSearch";
import PropertyCard from "@/components/PropertyCard";
import NewReviewModal from "@/components/NewReviewModal";
import FunBanner from "@/components/FunBanner";

type SortOption = "newest" | "rating" | "most_reviewed";

function HomePageInner() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [loading, setLoading] = useState(true);
  const [showNewReview, setShowNewReview] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("write") === "true") setShowNewReview(true);
  }, [searchParams]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) {
        const enriched = await Promise.all(
          data.map(async (p) => {
            const { data: reviews } = await supabase
              .from("reviews")
              .select("rating, photos")
              .eq("property_id", p.id);
            const count = reviews?.length ?? 0;
            const avg = count > 0 ? reviews!.reduce((s, r) => s + r.rating, 0) / count : 0;
            const photo_url = reviews?.find((r) => r.photos && r.photos.length > 0)?.photos?.[0] ?? null;
            return { ...p, avg_rating: avg, review_count: count, photo_url };
          })
        );
        const seen = new Set<string>();
        const unique = enriched.filter((p) => {
          const key = p.address + p.city;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setProperties(unique);
      }
      setLoading(false);
    }
    load();
  }, []);

  const cities = useMemo(() => {
    const all = properties.map((p) => p.city).filter(Boolean);
    return Array.from(new Set(all)).sort();
  }, [properties]);

  const filtered = useMemo(() => {
    let list = [...properties];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        p.address.toLowerCase().includes(q) || p.city.toLowerCase().includes(q)
      );
    }
    if (cityFilter) {
      list = list.filter((p) => p.city === cityFilter);
    }
    if (sort === "rating") list.sort((a, b) => (b.avg_rating ?? 0) - (a.avg_rating ?? 0));
    else if (sort === "most_reviewed") list.sort((a, b) => (b.review_count ?? 0) - (a.review_count ?? 0));
    return list;
  }, [properties, search, cityFilter, sort]);

  const handleSelect = useCallback((address: string) => {
    setSearch(address);
  }, []);


  return (
    <main className="py-6">
      {/* Hero */}
      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-3xl font-black text-[#111] leading-tight">
          {"בדקו את הדירה והמשכיר"}
          <br />
          <span className="text-[#C25E3A]">{"לפני שאתם חותמים"}</span>
        </h1>
        <p className="text-sm text-[#888] mt-2">
          {"ביקורות אמיתיות של שוכרים על דירות ומשכירים בישראל"}
        </p>
        <div className="flex justify-center gap-2 mt-4 flex-wrap">
          {["100% חינם", "אנונימי לחלוטין", "ביקורות אמיתיות"].map((badge) => (
            <span key={badge} className="inline-flex items-center gap-1 bg-[#FAF5F0] border border-[#EBD5C8] text-[#A94F2E] text-xs font-medium rounded-full px-3 py-1">
              {"✓ "}{badge}
            </span>
          ))}
        </div>
      </div>

      {/* Smart search */}
      <SmartSearch onSearch={handleSelect} />

      {/* Contribute CTA — writing reviews is the priority */}
      <div className="mt-5 bg-[#FAF5F0] border border-[#EBD5C8] rounded-2xl p-5 text-center">
        <p className="font-bold text-[#111] text-base">{"גרתם בדירה שכורה?"}</p>
        <p className="text-sm text-[#666] mt-1 mb-4">
          {"שתפו את החוויה שלכם — זה עוזר לשוכרים הבאים לבחור נכון."}
        </p>
        <button onClick={() => setShowNewReview(true)}
          className="w-full py-3 rounded-xl bg-[#C25E3A] text-white font-bold text-base hover:bg-[#A94F2E] transition-colors flex items-center justify-center gap-2">
          {"✏️ כתבו ביקורת"}
        </button>
      </div>

      {/* Filters row */}
      {!loading && (
        <div className="flex gap-2 mt-4 flex-wrap">
          {/* City filter */}
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="flex-1 min-w-[120px] bg-[#f5f5f5] border border-[#e5e5e5] rounded-xl px-3 py-2 text-sm text-[#555] focus:outline-none focus:border-[#C25E3A] transition-colors"
          >
            <option value="">{"כל הערים"}</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="flex-1 min-w-[140px] bg-[#f5f5f5] border border-[#e5e5e5] rounded-xl px-3 py-2 text-sm text-[#555] focus:outline-none focus:border-[#C25E3A] transition-colors"
          >
            <option value="newest">{"חדש ביותר"}</option>
            <option value="rating">{"דירוג גבוה"}</option>
            <option value="most_reviewed">{"הכי מבוקר"}</option>
          </select>

          {/* Clear filters */}
          {(cityFilter || sort !== "newest" || search) && (
            <button
              onClick={() => { setCityFilter(""); setSort("newest"); setSearch(""); }}
              className="px-3 py-2 text-sm text-[#aaa] hover:text-[#C25E3A] border border-[#e5e5e5] rounded-xl transition-colors bg-white"
            >
              {"✕ נקה"}
            </button>
          )}
        </div>
      )}

      <div className="mt-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border border-[#e5e5e5] rounded-xl overflow-hidden animate-pulse">
                <div className="h-36 bg-[#f0f0f0]" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-[#f0f0f0] rounded w-3/4" />
                  <div className="h-3 bg-[#f0f0f0] rounded w-1/2" />
                  <div className="h-3 bg-[#f0f0f0] rounded w-1/3 mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-[#aaa] py-16">
            <p className="text-lg mb-2">{"לא נמצאו נכסים"}</p>
            <p className="text-sm">{"נסו לשנות את הסינון — או שאלו את ה-AI למעלה ✨"}</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-[#bbb] mb-3">{filtered.length}{" נכסים"}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((p) => <PropertyCard key={p.id} property={p} />)}
            </div>
            <FunBanner />
          </>
        )}
      </div>

      {showNewReview && (
        <NewReviewModal onClose={() => setShowNewReview(false)} />
      )}

      <div className="mt-12 mb-6 bg-[#FAF5F0] border border-[#F3E6DC] rounded-xl p-4 text-xs text-[#999] text-center leading-relaxed" dir="rtl">
        {"דַּיָּר מאמינה בחופש הביטוי ובשקיפות. אנא שתפו את חוויותיכם באופן כן, מכבד ועניני. ביקורות הכוללות תוכן פוגעני, לשון הרע או שפה בוטה יוסרו."}
      </div>

    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense>
      <HomePageInner />
    </Suspense>
  );
}
