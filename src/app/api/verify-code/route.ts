import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { email, code } = await req.json();
  if (!email || !code) return NextResponse.json({ error: "חסרים פרטים" }, { status: 400 });
  const normalized = String(email).trim().toLowerCase();

  const { data } = await supabase
    .from("verification_codes")
    .select("*")
    .eq("email", normalized)
    .eq("code", code)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (!data) return NextResponse.json({ error: "קוד שגוי או פג תוקף" }, { status: 400 });

  // Keep the row as server-side proof of verification: submit-review
  // checks for the VERIFIED sentinel and consumes it on publish.
  await supabase.from("verification_codes")
    .update({ code: "VERIFIED", expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString() })
    .eq("email", normalized);
  return NextResponse.json({ ok: true });
}
