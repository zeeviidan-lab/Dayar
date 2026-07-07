"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Property } from "@/lib/supabase";
import StarRating from "./StarRating";
import NewReviewModal from "./NewReviewModal";

// Card image quality ladder: reviewer photo → Street View → placeholder.
// Street View returns a gray "no imagery" JPEG with HTTP 200, so presence
// must be checked via the (free) metadata endpoint rather than onError.
function CardImage({ p, apiKey }: { p: Property; apiKey?: string }) {
  const hasLocation = Boolean(p.lat && p.lng);
  const [svOk, setSvOk] = useState<boolean | null>(null);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    if (p.photo_url || !apiKey || !hasLocation) return;
    fetch(`https://maps.googleapis.com/maps/api/streetview/metadata?location=${p.lat},${p.lng}&source=outdoor&key=${apiKey}`)
      .then((r) => r.json())
      .then((d) => setSvOk(d.status === "OK"))
      .catch(() => setSvOk(true));
  }, [p.photo_url, p.lat, p.lng, apiKey, hasLocation]);

  const src = p.photo_url
    ? p.photo_url
    : apiKey && hasLocation && svOk
      ? `https://maps.googleapis.com/maps/api/streetview?size=640x360&location=${p.lat},${p.lng}&fov=75&pitch=5&source=outdoor&key=${apiKey}`
      : null;

  if (src && !broken) {
    return (
      <div className="relative h-36 bg-[#f5f5f5]">
        <img src={src} alt={p.address} className="w-full h-full object-cover"
          onError={() => setBroken(true)} />
      </div>
    );
  }
  // Placeholder while metadata loads or when nothing is available
  return (
    <div className="relative h-36 bg-[#FAF5F0] flex items-center justify-center">
      <span className="text-4xl opacity-60" aria-hidden="true">🏠</span>
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
