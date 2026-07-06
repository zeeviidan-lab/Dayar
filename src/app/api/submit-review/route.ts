import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyTurnstile } from "@/lib/turnstile-server";

// Reviews are written server-side only (service role), behind Turnstile —
// the public INSERT policy on the reviews table can be dropped.

function intInRange(v: unknown, min: number, max: number): number | null {
  const n = Number(v);
  if (!Number.isInteger(n) || n < min || n > max) return null;
  return n;
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!(await verifyTurnstile(body.turnstileToken))) {
    return NextResponse.json({ error: "אימות אבטחה נכשל, רעננו את הדף ונסו שוב" }, { status: 403 });
  }

  const propertyId = typeof body.property_id === "string" ? body.property_id : null;
  const rating = intInRange(body.rating, 1, 5);
  if (!propertyId || !rating) {
    return NextResponse.json({ error: "נתונים חסרים" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  // Verification is proven server-side: verify-code leaves a VERIFIED
  // sentinel row, consumed after a successful publish. The client's
  // is_verified flag is never trusted.
  const verifierEmail = typeof body.verifier_email === "string"
    ? body.verifier_email.trim().toLowerCase().slice(0, 320) : null;
  if (!verifierEmail) {
    return NextResponse.json({ error: "יש לאמת אימייל לפני פרסום" }, { status: 403 });
  }
  const { data: proof } = await supabase
    .from("verification_codes")
    .select("email")
    .eq("email", verifierEmail)
    .eq("code", "VERIFIED")
    .gt("expires_at", new Date().toISOString())
    .single();
  if (!proof) {
    return NextResponse.json({ error: "יש לאמת אימייל לפני פרסום" }, { status: 403 });
  }

  // One review per email per property
  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("property_id", propertyId)
    .ilike("verifier_email", verifierEmail)
    .limit(1);
  if (existing && existing.length > 0) {
    return NextResponse.json({ error: "כבר פרסמת ביקורת על נכס זה עם האימייל הזה" }, { status: 409 });
  }

  // Photos must point at our own storage bucket
  const photos = Array.isArray(body.photos)
    ? body.photos
        .filter((u: unknown): u is string => typeof u === "string" && u.startsWith(`${supabaseUrl}/storage/`))
        .slice(0, 3)
    : [];

  const categories = [
    "rating_property", "rating_maintenance", "rating_building", "rating_landlord",
    "rating_neighbors", "rating_parking", "rating_noise", "rating_transport", "rating_shopping",
  ] as const;
  const catValues: Record<string, number | null> = {};
  for (const key of categories) {
    catValues[key] = body[key] == null ? null : intInRange(body[key], 1, 5);
  }

  const { data: review, error } = await supabase.from("reviews").insert({
    property_id: propertyId,
    rating,
    ...catValues,
    text: typeof body.text === "string" ? body.text.slice(0, 5000) : null,
    is_anonymous: body.is_anonymous !== false,
    is_verified: true,
    verifier_email: verifierEmail,
    rent_amount: intInRange(body.rent_amount, 1, 1000000),
    rent_year: intInRange(body.rent_year, 1990, 2100),
    photos: photos.length > 0 ? photos : null,
  }).select("id").single();

  if (error || !review) {
    return NextResponse.json({ error: "שגיאה בשמירה" }, { status: 500 });
  }

  // Consume the verification — a new code is needed for the next review
  await supabase.from("verification_codes").delete().eq("email", verifierEmail);

  return NextResponse.json({ ok: true, id: review.id });
}
