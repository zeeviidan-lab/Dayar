"use client";

import Link from "next/link";
import { useState } from "react";
import { Property } from "@/lib/supabase";
import StarRating from "./StarRating";
import ReviewModal from "./ReviewModal";

export default function PropertyCard({ property: p, onReviewDone }: { property: Property; onReviewDone?: () => void }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const hasLocation = p.lat && p.lng;
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="bg-white border border-[#e5e5e5] rounded-xl overflow-hidden hover:border-[#f97316]/40 hover:shadow-sm transition-all">
        <Link href={`/property/${p.id}`}>
          {apiKey && hasLocation && (
            <div className="relative h-36 bg-[#f5f5f5]">
              <img
                src={`https://maps.googleapis.com/maps/api/streetview?size=560x144&location=${p.lat},${p.lng}&fov=90&pitch=0&key=${apiKey}`}
                alt={p.address}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
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
            className="w-full py-2 rounded-xl border border-[#f97316] text-[#f97316] text-sm font-medium hover:bg-[#fff7f0] transition-colors">
            {"+ כתוב ביקורת"}
          </button>
        </div>
      </div>

      {showModal && (
        <ReviewModal
          propertyId={p.id}
          onClose={() => setShowModal(false)}
          onDone={() => { setShowModal(false); onReviewDone?.(); }}
        />
      )}
    </>
  );
}
