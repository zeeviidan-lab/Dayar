import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://hadayar.co.il";

  const { data: properties } = await supabase
    .from("properties")
    .select("id, updated_at")
    .order("created_at", { ascending: false });

  const propertyUrls: MetadataRoute.Sitemap = (properties ?? []).map((p) => ({
    url: `${baseUrl}/property/${p.id}`,
    lastModified: p.updated_at ?? new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/accessibility`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    ...propertyUrls,
  ];
}
