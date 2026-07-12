import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Flags a review for admin attention by incrementing its report_count.
// Reports never auto-hide content (that would let anyone censor honest
// reviews by mass-reporting) — they only surface it in /admin for a human.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { reviewId } = await req.json();
  if (typeof reviewId !== "string" || !reviewId) {
    return NextResponse.json({ error: "מזהה חסר" }, { status: 400 });
  }

  const { error } = await supabase.rpc("increment_report", { review_id: reviewId });
  if (error) {
    return NextResponse.json({ error: "שגיאה" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
