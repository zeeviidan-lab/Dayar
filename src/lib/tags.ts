export type TagColor = "red" | "orange" | "green";

export const TAGS: { label: string; color: TagColor }[] = [
  { label: "ריח רטיבות", color: "red" },
  { label: "שכן רועש", color: "red" },
  { label: "לא מתקן תקלות", color: "red" },
  { label: "פיקדון לא הוחזר", color: "red" },
  { label: "חדירת פרטיות", color: "red" },
  { label: "העלה שכירות פתאום", color: "orange" },
  { label: "מגיב לאט", color: "orange" },
  { label: "תחזוקה טובה", color: "green" },
  { label: "משכיר נחמד", color: "green" },
  { label: "מחיר הוגן", color: "green" },
  { label: "מגיב מהר", color: "green" },
];

export const TAG_COLOR_CLASSES: Record<TagColor, string> = {
  red: "bg-red-900/40 text-red-300 border-red-700",
  orange: "bg-orange-900/40 text-orange-300 border-orange-700",
  green: "bg-green-900/40 text-green-300 border-green-700",
};

export function getTagColor(tag: string): TagColor {
  return TAGS.find((t) => t.label === tag)?.color ?? "green";
}
