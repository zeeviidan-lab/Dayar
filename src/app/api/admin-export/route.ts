import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Full data export for backups — admin key required.
export async function POST(req: NextRequest) {
  const { adminKey } = await req.json();

  const serverKey = process.env.ADMIN_KEY;
  if (!serverKey || adminKey !== serverKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const [properties, reviews, tags, responses] = await Promise.all([
    supabase.from("properties").select("*"),
    supabase.from("reviews").select("*"),
    supabase.from("review_tags").select("*"),
    supabase.from("landlord_responses").select("*"),
  ]);

  return NextResponse.json({
    exported_at: new Date().toISOString(),
    properties: properties.data ?? [],
    reviews: reviews.data ?? [],
    review_tags: tags.data ?? [],
    landlord_responses: responses.data ?? [],
  });
}
