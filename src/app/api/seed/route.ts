import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SEED_PROPERTIES, SEED_REVIEWS } from "@/lib/seed";

export async function POST() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Insert properties
  const { data: props, error: propError } = await supabase
    .from("properties")
    .insert(SEED_PROPERTIES)
    .select();

  if (propError || !props) {
    return NextResponse.json({ error: propError?.message ?? "Failed to insert properties" }, { status: 500 });
  }

  // Insert reviews
  for (const rev of SEED_REVIEWS) {
    const prop = props[rev.propIdx];
    const { data: review, error: revError } = await supabase
      .from("reviews")
      .insert({
        property_id: prop.id,
        rating: rev.rating,
        rating_maintenance: rev.rating_maintenance,
        rating_communication: rev.rating_communication,
        rating_neighbors: rev.rating_neighbors,
        rating_value: rev.rating_value,
        text: rev.text,
        is_anonymous: rev.is_anonymous,
      })
      .select()
      .single();

    if (revError || !review) continue;

    if (rev.tags.length > 0) {
      await supabase.from("review_tags").insert(
        rev.tags.map((tag) => ({ review_id: review.id, tag }))
      );
    }
  }

  return NextResponse.json({ ok: true, properties: props.length });
}
