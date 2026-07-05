import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { verifyTurnstile } from "@/lib/turnstile-server";

export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return new Response("לא נמצא קובץ", { status: 400 });

    const turnstileToken = formData.get("turnstileToken");
    if (!(await verifyTurnstile(typeof turnstileToken === "string" ? turnstileToken : null))) {
      return new Response("אימות אבטחה נכשל", { status: 403 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");

    const prompt = `אתה עוזר ידידותי לדיירים בישראל. קרא את חוזה השכירות וכתוב תשובה קצרה וידידותית — כמו חבר שמסביר.

כתוב בגוף שני ("שים לב ש...", "כדאי לשאול...").
**אל תכתוב טבלאות, אל תשתמש בכותרות משנה, אל תפרט כל סעיף.**

בשלושה אבזצים בלבד:
1. שורה אחת עם עיקרי החוזה (כתובת, שכירות, תקופה, פיקדון)
2. שניים-שלושה דברים שכדאי לדעת לפני חתימה — בטון רגוע
3. שאלה אחת-שתיים לשאול את המשכיר

ענה בעברית בלבד. בסוף: "⚠️ מידע כללי בלבד, לא ייעוץ משפטי."`;

    type MessageParam = Anthropic.MessageParam;
    let messages: MessageParam[];

    if (isPdf) {
      messages = [{
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: buffer.toString("base64"),
            },
          } as Anthropic.DocumentBlockParam,
          { type: "text", text: prompt },
        ],
      }];
    } else {
      const text = buffer.toString("utf-8");
      if (!text.trim()) return new Response("לא ניתן לקרוא את הקובץ", { status: 400 });
      messages = [{
        role: "user",
        content: `${prompt}\n\nהחוזה:\n${text.slice(0, 15000)}`,
      }];
    }

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          const anthropicStream = await client.messages.stream({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 2048,
            messages,
          });

          for await (const chunk of anthropicStream) {
            if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }
        } catch (e) {
          controller.enqueue(encoder.encode(`\n\nשגיאה: ${String(e)}`));
          console.error("stream error:", e);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (e) {
    console.error("route error:", e);
    return new Response(`שגיאה: ${String(e)}`, { status: 500 });
  }
}
