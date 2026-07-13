"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Property } from "@/lib/supabase";
import StarRating from "./StarRating";
import NewReviewModal from "./NewReviewModal";

// Card image: show the actual building (Street View) where Google has
// imagery, falling back to a clean location map for addresses with none
// (Street View returns a gray "no imagery" JPEG with HTTP 200, so presence
// is checked via the free metadata endpoint). Reviewer-uploaded photos are
// never used here — they're unvetted (selfies etc.) and show in the review.
export function locationMapUrl(lat: number, lng: number, apiKey: string): string {
  const params = [
    `center=${lat},${lng}`,
    "zoom=17",
    "size=640x260",
    "scale=2",
    `markers=color:0xC25E3A|${lat},${lng}`,
    "style=feature:poi|visibility:off",
    "style=feature:transit|visibility:off",
    `key=${apiKey}`,
  ];
  return `https://maps.googleapis.com/maps/api/staticmap?${params.join("&")}`;
}

function streetViewUrl(lat: number, lng: number, apiKey: string): string {
  return `https://maps.googleapis.com/maps/api/streetview?size=640x360&location=${lat},${lng}&fov=75&pitch=5&source=outdoor&key=${apiKey}`;
}

function CardImage({ p, apiKey }: { p: Property; apiKey?: string }) {
  const [broken, setBroken] = useState(false);
  const [hasStreetView, setHasStreetView] = useState<boolean | null>(null);
  const hasLocation = Boolean(p.lat && p.lng);

  useEffect(() => {
    if (!apiKey || !hasLocation) return;
    let cancelled = false;
    fetch(`https://maps.googleapis.com/maps/api/streetview/metadata?location=${p.lat},${p.lng}&source=outdoor&key=${apiKey}`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setHasStreetView(d.status === "OK"); })
      .catch(() => { if (!cancelled) setHasStreetView(false); });
    return () => { cancelled = true; };
  }, [apiKey, hasLocation, p.lat, p.lng]);

  // Building photo when Street View exists; clean map otherwise.
  const src = apiKey && hasLocation && hasStreetView !== null
    ? (hasStreetView ? streetViewUrl(p.lat!, p.lng!, apiKey) : locationMapUrl(p.lat!, p.lng!, apiKey))
    : null;

  if (src && !broken) {
    return (
      <div className="relative h-36 bg-[#f5f5f5]">
        <img src={src} alt={p.address} className="w-full h-full object-cover"
          onError={() => setBroken(true)} />
      </div>
    );
  }
  return (
    <div className="relative h-36 bg-[#FAF5F0] flex items-center justify-center" aria-hidden="true">
      <span className="text-4xl opacity-60">🏠</span>
    </div>
  );
}

export default function PropertyCard({ property: p }: { property: Property }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="bg-white border border-[#e5e5e5] rounded-xl overflow-hidden hover:border-[#C25E3A]/40 hover:shadow-sm transition-all">
        <Link href={`/property/${p.id}`}>
          <CardImage p={p} apiKey={apiKey} />
          <div className="p-4 flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#111] truncate">{p.address}</p>
              <p className="text-sm text-[#666] mt-0.5">{p.city}</p>
              {p.landlord_name && (
                <p className="text-xs text-[#999] mt-1">{"משכיר: "}{p.landlord_name}</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1 mr-3 shrink-0">
              <StarRating rating={p.avg_rating ?? 0} size="sm" />
              <p className="text-xs text-[#aaa]">{p.review_count ?? 0}{" ביקורות"}</p>
            </div>
          </div>
        </Link>

        <div className="px-4 pb-3">
          <button
            onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
            style={{ display: "flex", width: "100%" }}
            className="py-2 rounded-xl border border-[#C25E3A] text-[#C25E3A] text-sm font-medium hover:bg-[#FAF5F0] transition-colors justify-center items-center">
            {"+ כתוב ביקורת"}
          </button>
        </div>
      </div>

      {showModal && (
        <NewReviewModal
          existingPropertyId={p.id}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
