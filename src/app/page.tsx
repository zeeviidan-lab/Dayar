"use client";

import { useEffect, useState, useCallback, useMemo, Fragment } from "react";
import Link from "next/link";
import { supabase, Property } from "@/lib/supabase";
import AddressSearch from "@/components/AddressSearch";
import PropertyCard from "@/components/PropertyCard";
import NewReviewModal from "@/components/NewReviewModal";

type SortOption = "newest" | "rating" | "most_reviewed";

export default function HomePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [loading, setLoading] = useState(true);
  const [showNewReview, setShowNewReview] = useState(false);

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
              .select("rating")
              .eq("property_id", p.id);
            const count = reviews?.length ?? 0;
            const avg = count > 0 ? reviews!.reduce((s, r) => s + r.rating, 0) / count : 0;
            return { ...p, avg_rating: avg, review_count: count };
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
      <button onClick={() => setShowNewReview(true)}
        className="w-full py-3 rounded-xl bg-[#f97316] text-white font-bold text-base hover:bg-[#fb923c] transition-colors mb-4 flex items-center justify-center gap-2">
        {"✏️ כתוב ביקורת חדשה"}
      </button>

      <AddressSearch onSelect={handleSelect} />

      {/* Filters row */}
      {!loading && (
        <div className="flex gap-2 mt-4 flex-wrap">
          {/* City filter */}
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="flex-1 min-w-[120px] bg-[#f5f5f5] border border-[#e5e5e5] rounded-xl px-3 py-2 text-sm text-[#555] focus:outline-none focus:border-[#f97316] transition-colors"
          >
            <option value="">{"כל הערים"}</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="flex-1 min-w-[140px] bg-[#f5f5f5] border border-[#e5e5e5] rounded-xl px-3 py-2 text-sm text-[#555] focus:outline-none focus:border-[#f97316] transition-colors"
          >
            <option value="newest">{"חדש ביותר"}</option>
            <option value="rating">{"דירוג גבוה"}</option>
            <option value="most_reviewed">{"הכי מבוקר"}</option>
          </select>

          {/* Clear filters */}
          {(cityFilter || sort !== "newest" || search) && (
            <button
              onClick={() => { setCityFilter(""); setSort("newest"); setSearch(""); }}
              className="px-3 py-2 text-sm text-[#aaa] hover:text-[#f97316] border border-[#e5e5e5] rounded-xl transition-colors bg-white"
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
            <p className="text-sm">{"נסה לשנות את הסינון"}</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-[#bbb] mb-3">{filtered.length}{" נכסים"}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((p) => <PropertyCard key={p.id} property={p} />)}
            </div>
            <div className="mt-4 rounded-xl border border-dashed border-[#e5e5e5] bg-white flex items-center justify-center py-6 text-xs text-[#ccc]">
              פרסומת
            </div>
          </>
        )}
      </div>

      {showNewReview && (
        <NewReviewModal onClose={() => setShowNewReview(false)} onDone={() => { setShowNewReview(false); window.location.reload(); }} />
      )}

      <footer className="mt-16 pb-8 text-center text-xs text-[#bbb] flex justify-center gap-4">
        <Link href="/terms" className="hover:text-[#f97316]">{"תנאי שימוש"}</Link>
        <span>{"·"}</span>
        <Link href="/privacy" className="hover:text-[#f97316]">{"מדיניות פרטיות"}</Link>
        <span>{"·"}</span>
        <Link href="/contact" className="hover:text-[#f97316]">{"צור קשר"}</Link>
      </footer>
    </main>
  );
}
