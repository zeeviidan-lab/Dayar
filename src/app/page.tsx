"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { supabase, Property } from "@/lib/supabase";
import AddressSearch from "@/components/AddressSearch";
import PropertyCard from "@/components/PropertyCard";

export default function HomePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filtered, setFiltered] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

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
        setFiltered(unique);
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleSelect = useCallback(
    (address: string) => {
      if (!address) { setFiltered(properties); return; }
      const q = address.toLowerCase();
      setFiltered(properties.filter((p) =>
        p.address.toLowerCase().includes(q) || p.city.toLowerCase().includes(q)
      ));
    },
    [properties]
  );

  return (
    <main className="py-6">
      <AddressSearch onSelect={handleSelect} />

      <div className="mt-8">
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
            <p className="text-sm">{"נסה כתובת אחרת"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((p) => <PropertyCard key={p.id} property={p} />)}
          </div>
        )}
      </div>

      <footer className="mt-16 pb-8 text-center text-xs text-[#bbb] flex justify-center gap-4">
        <Link href="/terms" className="hover:text-[#f97316]">{"תנאי שימוש"}</Link>
        <span>{"·"}</span>
        <Link href="/privacy" className="hover:text-[#f97316]">{"מדיניות פרטיות"}</Link>
      </footer>
    </main>
  );
}
