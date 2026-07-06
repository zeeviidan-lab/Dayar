import { Metadata } from "next";
import { supabase } from "@/lib/supabase";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { data: property } = await supabase
    .from("properties")
    .select("address, city, landlord_name")
    .eq("id", id)
    .single();

  if (!property) {
    return { title: "נכס | דַּיָּר" };
  }

  // Lead with "ביקורות" — exact match for address-review searches
  // The root layout template appends "| דַּיָּר" automatically
  const title = `ביקורות דיירים על ${property.address}, ${property.city}`;
  const description = `מה דיירים אומרים על ${property.address} ב${property.city}? דירוגים וביקורות אמיתיות של שוכרים${property.landlord_name ? ` — משכיר: ${property.landlord_name}` : ""}. דַּיָּר — פלטפורמת ביקורות הדיירים של ישראל.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      locale: "he_IL",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function PropertyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [{ data: property }, { data: reviews }] = await Promise.all([
    supabase.from("properties").select("address, city").eq("id", id).single(),
    supabase.from("reviews").select("rating, text, created_at").eq("property_id", id),
  ]);

  // Structured data so Google understands these are apartment reviews
  // (and can show star ratings in search results)
  let jsonLd: Record<string, unknown> | null = null;
  if (property && reviews && reviews.length > 0) {
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    jsonLd = {
      "@context": "https://schema.org",
      "@type": "Apartment",
      name: `${property.address}, ${property.city}`,
      address: {
        "@type": "PostalAddress",
        streetAddress: property.address,
        addressLocality: property.city,
        addressCountry: "IL",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: Math.round(avg * 10) / 10,
        reviewCount: reviews.length,
        bestRating: 5,
        worstRating: 1,
      },
      review: reviews.slice(0, 10).map((r) => ({
        "@type": "Review",
        reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 },
        datePublished: r.created_at?.slice(0, 10),
        reviewBody: r.text ?? undefined,
        author: { "@type": "Person", name: "דייר אנונימי" },
      })),
    };
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
