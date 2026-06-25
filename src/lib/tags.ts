export type TagColor = "red" | "orange" | "green" | "blue";

export const TAGS: { label: string; color: TagColor }[] = [
  // שלילי
  { label: "ריח רטיבות", color: "red" },
  { label: "שכן רועש", color: "red" },
  { label: "לא מתקן תקלות", color: "red" },
  { label: "פיקדון לא הוחזר", color: "red" },
  { label: "חדירת פרטיות", color: "red" },
  { label: "העלה שכירות פתאום", color: "orange" },
  { label: "מגיב לאט", color: "orange" },
  // חיובי
  { label: "תחזוקה טובה", color: "green" },
  { label: "משכיר נחמד", color: "green" },
  { label: "מחיר הוגן", color: "green" },
  { label: "מגיב מהר", color: "green" },
  // קרוב אלי
  { label: "סופרמרקט קרוב", color: "blue" },
  { label: "קופת חולים קרובה", color: "blue" },
  { label: "בית מרקחת קרוב", color: "blue" },
  { label: "תחבורה ציבורית", color: "blue" },
  { label: "גן ילדים / בי״ס", color: "blue" },
];

export const TAG_COLOR_CLASSES: Record<TagColor, string> = {
  red: "bg-red-50 text-red-500 border-red-200",
  orange: "bg-orange-50 text-orange-500 border-orange-200",
  green: "bg-green-50 text-green-600 border-green-200",
  blue: "bg-blue-50 text-blue-500 border-blue-200",
};

export function getTagColor(tag: string): TagColor {
  return TAGS.find((t) => t.label === tag)?.color ?? "green";
}
