import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { type, text } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: "empty" }, { status: 400 });

  const label = type === "bug" ? "🐛 באג" : "💡 הצעה לשיפור";
  const safeText = String(text).slice(0, 2000)
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

  await resend.emails.send({
    from: "דַּיָּר <info@hadayar.co.il>",
    to: "zeevi.idan@gmail.com",
    subject: `דַּיָּר פידבק: ${label}`,
    html: `<div dir="rtl"><h2>${label}</h2><p>${safeText}</p></div>`,
  });

  return NextResponse.json({ ok: true });
}
