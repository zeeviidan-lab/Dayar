"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface TickerItem {
  address: string;
  city: string;
  rating: number;
  text: string | null;
}

export default function ReviewsTicker() {
  const [items, setItems] = useState<TickerItem[]>([]);

  useEffect(() => {
    async function load() {
      const { data: reviews } = await supabase
        .from("reviews")
        .select("rating, text, property_id")
        .eq("is_anonymous", true)
        .order("created_at", { ascending: false })
        .limit(20);

      if (!reviews?.length) return;

      const withProps = await Promise.all(
        reviews.map(async (r) => {
          const { data: prop } = await supabase
            .from("properties")
            .select("address, city")
            .eq("id", r.property_id)
            .single();
          return prop ? { address: prop.address, city: prop.city, rating: r.rating, text: r.text } : null;
        })
      );

      setItems(withProps.filter(Boolean) as TickerItem[]);
    }
    load();
  }, []);

  if (items.length === 0) return null;

  const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);

  // Duplicate for seamless loop
  const doubled = [...items, ...items];

  return (
    <div className="w-full bg-[#111] overflow-hidden py-2 mb-6 rounded-xl" dir="ltr">
      <div className="flex whitespace-nowrap animate-ticker">
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-2 px-6 text-sm">
            <span className="text-[#f97316] font-bold">{stars(item.rating)}</span>
            <span className="text-white font-medium">{item.address}, {item.city}</span>
            {item.text && (
              <span className="text-[#aaa]">— {item.text.slice(0, 60)}{item.text.length > 60 ? "..." : ""}</span>
            )}
            <span className="text-[#444] mx-4">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
