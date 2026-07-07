import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase, Property } from "@/lib/supabase";
import PropertyCard from "@/components/PropertyCard";

export const revalidate = 3600;

async function getCityProperties(city: string): Promise<Property[]> {
  const { data } = await supabase
    .from("properties")
    .select("*")
    .eq("city", city)
    .order("created_at", { ascending: false });
  if (!data || data.length === 0) return [];

  const enriched = await Promise.all(
    data.map(async (p) => {
      const { data: reviews } = await supabase
        .from("reviews")
        .select("rating, photos")
        .eq("property_id", p.id);
      const count = reviews?.length ?? 0;
      const avg = count > 0 ? reviews!.reduce((s, r) => s + r.rating, 0) / count : 0;
      const photo_url = reviews?.find((r) => r.photos && r.photos.length > 0)?.photos?.[0] ?? null;
      return { ...p, avg_rating: avg, review_count: count, photo_url };
    })
  );

  const seen = new Set<string>();
  return enriched.filter((p) => {
    const key = p.address + p.city;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
  const { name } = await params;
  const city = decodeURIComponent(name);
  // The root layout template appends "| דַּיָּר" automatically
  const title = `ביקורות דיירים ב${city} — דירות ומשכירים`;
  const description = `לפני השכרת דירה ב${city} — מה שוכרים אומרים על הדירות והמשכירים? ביקורות אמיתיות ואנונימיות של דיירים על דירות להשכרה. בדקו את הכתובת לפני שאתם חותמים על חוזה שכירות.`;
  return {
    title,
    description,
    alternates: { canonical: `https://hadayar.co.il/city/${encodeURIComponent(city)}` },
    openGraph: { title, description, locale: "he_IL", type: "website" },
  };
}

export default async function CityPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const city = decodeURIComponent(name);
  const properties = await getCityProperties(city);
  if (properties.length === 0) notFound();

  const totalReviews = properties.reduce((s, p) => s + (p.review_count ?? 0), 0);

  return (
    <main className="py-6" dir="rtl">
      <div className="w-full max-w-[560px] md:max-w-[900px] mx-auto px-4 md:px-8">
        <nav className="text-xs text-[#999] mb-4">
          <Link href="/" className="hover:text-[#C25E3A] transition-colors">{"דף הבית"}</Link>
          <span className="mx-1">{"›"}</span>
          <span>{city}</span>
        </nav>

        <h1 className="text-2xl font-black text-[#111]">{"ביקורות דיירים ב"}{city}</h1>
        <p className="text-sm text-[#666] mt-1 mb-6">
          {properties.length}{" נכסים"}{totalReviews > 0 ? ` · ${totalReviews} ביקורות של שוכרים` : ""}
          {" — בדקו את הכתובת לפני החתימה"}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {properties.map((p) => <PropertyCard key={p.id} property={p} />)}
        </div>

        <div className="mt-10 bg-[#FAF5F0] border border-[#F3E6DC] rounded-xl p-4 text-sm text-[#666] text-center">
          {"גרתם בדירה שכורה ב"}{city}{"? "}
          <Link href="/?write=true" className="text-[#C25E3A] font-medium underline">{"כתבו ביקורת"}</Link>
          {" ועזרו לשוכר הבא."}
        </div>
      </div>
    </main>
  );
}
