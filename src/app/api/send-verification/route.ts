import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "חסר אימייל" }, { status: 400 });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  await supabase.from("verification_codes").upsert({ email, code, expires_at: expires });

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "דַּיָּר <info@hadayar.co.il>",
      to: email,
      subject: "קוד אימות – דַּיָּר",
      html: `<div dir="rtl" style="font-family:Arial;padding:24px;max-width:400px">
        <h2 style="color:#f97316">דַּיָּר – אימות ביקורת</h2>
        <p>קוד האימות שלך:</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#111;padding:16px 0">${code}</div>
        <p style="color:#aaa;font-size:12px">הקוד תקף ל-10 דקות.</p>
      </div>`,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    console.error("Resend error:", res.status, body);
    return NextResponse.json({ error: "שגיאה בשליחת אימייל", details: body }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
