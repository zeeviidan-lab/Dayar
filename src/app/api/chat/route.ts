import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { verifyTurnstile } from "@/lib/turnstile-server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { messages, turnstileToken } = await req.json();

  if (!(await verifyTurnstile(turnstileToken))) {
    return NextResponse.json({ error: "אימות אבטחה נכשל, רעננו את הדף ונסו שוב" }, { status: 403 });
  }

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: `אתה יועץ משפטי המתמחה בדיני שכירות בישראל. אתה עונה בעברית בלבד.
אתה עוזר לדיירים להבין את זכויותיהם לפי חוק שכירות הוגנת 2017 וחוק השכירות והשאילה.
ענה בצורה ברורה, ידידותית ומעשית. אם שואלים על מקרה ספציפי, תן עצה מעשית.
הדגש תמיד שהמידע הוא כללי ולא תחליף לייעוץ משפטי מקצועי.
תשובות קצרות וממוקדות — לא יותר מ-3 פסקאות.`,
    messages: messages,
  });

  const content = response.content[0];
  if (content.type !== "text") {
    return NextResponse.json({ error: "שגיאה" }, { status: 500 });
  }

  return NextResponse.json({ reply: content.text });
}
