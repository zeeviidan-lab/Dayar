import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return new Response("לא נמצא קובץ", { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let text = "";

    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse: (buf: Buffer) => Promise<{ text: string }> = require("pdf-parse");
        const data = await pdfParse(buffer);
        text = data.text;
      } catch (pdfErr) {
        console.error("pdf-parse error:", pdfErr);
        return new Response(`שגיאה בקריאת PDF: ${String(pdfErr)}`, { status: 500 });
      }
    } else {
      text = buffer.toString("utf-8");
    }

    if (!text.trim()) {
      return new Response("לא ניתן לקרוא את הקובץ", { status: 400 });
    }

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          const anthropicStream = await client.messages.stream({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 2048,
            messages: [{
              role: "user",
              content: `אתה עוזר לדיירים לסקור חוזי שכירות בישראל. קרא את החוזה הבא וספק:

1. **סיכום קצר** — מה עיקר החוזה (כתובת, שכירות חודשית, תקופה, פיקדון)
2. **נקודות חשובות לתשומת לב** — סעיפים שכדאי לשים לב אליהם
3. **סעיפים בעייתיים** — דברים שעשויים להיות לא סבירים או בניגוד לחוק שכירות הוגנת 2017
4. **המלצות** — מה לבדוק / לשאול את המשכיר

ענה בעברית בלבד. בסוף הוסף: "⚠️ מידע זה כללי בלבד ואינו מהווה ייעוץ משפטי. לקבלת ייעוץ מחייב פנה לעורך דין."

החוזה:
${text.slice(0, 15000)}`,
            }],
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
    return new Response(`שגיאה כללית: ${String(e)}`, { status: 500 });
  }
}
