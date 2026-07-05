import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { type, id, adminKey } = await req.json();

  // Server-only secret — must never be exposed via a NEXT_PUBLIC_* variable
  const serverKey = process.env.ADMIN_KEY;
  if (!serverKey || adminKey !== serverKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Key check only — used by the admin unlock UI
  if (type === "verify") {
    return NextResponse.json({ ok: true });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  if (type === "review") {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else if (type === "property") {
    await supabase.from("reviews").delete().eq("property_id", id);
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
