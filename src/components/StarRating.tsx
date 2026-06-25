"use client";

interface Props {
  rating: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export default function StarRating({ rating, size = "md", interactive = false, onRate }: Props) {
  const sizes = { sm: "text-sm", md: "text-xl", lg: "text-3xl" };
  return (
    <div className={`flex gap-0.5 ${sizes[size]}`} dir="ltr">
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          onClick={() => interactive && onRate?.(s)}
          className={`${interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""} ${
            s <= Math.round(rating) ? "text-[#f97316]" : "text-[#ddd]"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
}
