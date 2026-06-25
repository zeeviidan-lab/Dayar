import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  const { email, code } = await req.json();
  if (!email || !code) return NextResponse.json({ error: "חסרים פרטים" }, { status: 400 });

  const { data } = await supabase
    .from("verification_codes")
    .select("*")
    .eq("email", email)
    .eq("code", code)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (!data) return NextResponse.json({ error: "קוד שגוי או פג תוקף" }, { status: 400 });

  await supabase.from("verification_codes").delete().eq("email", email);
  return NextResponse.json({ ok: true });
}
