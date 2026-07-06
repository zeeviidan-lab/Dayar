"use client";

interface Props {
  rating: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export default function StarRating({ rating, size = "md", interactive = false, onRate }: Props) {
  const sizes = { sm: "text-sm", md: "text-xl", lg: "text-3xl" };

  if (interactive) {
    // Tappable stars: comfortable touch targets (44px) regardless of visual size
    const starSize = size === "lg" ? "text-4xl" : "text-2xl";
    return (
      <div className={`flex ${starSize}`} dir="ltr">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            aria-label={`דירוג ${s} מתוך 5`}
            onClick={() => onRate?.(s)}
            className={`min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer hover:scale-110 transition-transform ${
              s <= Math.round(rating) ? "text-[#C25E3A]" : "text-[#ddd]"
            }`}
          >
            ★
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex gap-0.5 ${sizes[size]}`} dir="ltr">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= Math.round(rating) ? "text-[#C25E3A]" : "text-[#ddd]"}>
          ★
        </span>
      ))}
    </div>
  );
}
