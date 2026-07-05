import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { verifyTurnstile } from "@/lib/turnstile-server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { type, text, turnstileToken } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: "empty" }, { status: 400 });

  if (!(await verifyTurnstile(turnstileToken))) {
    return NextResponse.json({ error: "אימות אבטחה נכשל" }, { status: 403 });
  }

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
