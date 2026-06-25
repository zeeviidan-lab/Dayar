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

  const title = `${property.address}, ${property.city} | דַּיָּר`;
  const description = `קרא ביקורות דיירים על ${property.address} ב${property.city}${property.landlord_name ? ` — משכיר: ${property.landlord_name}` : ""}. פלטפורמת ביקורות דיירים בישראל.`;

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

export default function PropertyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
