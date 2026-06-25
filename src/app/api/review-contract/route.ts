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

    const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");

    const prompt = `אתה עוזר ידידותי לדיירים בישראל. קרא את חוזה השכירות וספק סקירה מאוזנת וקצרה:

1. **עיקרי החוזה** — כתובת, שכירות חודשית, תקופה, פיקדון
2. **נקודות לתשומת לב** — עד 3 סעיפים שכדאי לקרוא שוב לפני חתימה
3. **שאלות כדאי לשאול את המשכיר** — 2-3 שאלות מעשיות

הטון יהיה רגוע ומועיל — לא מפחיד. רוב החוזים תקינים, פשוט כדאי להיות מודע. ענה בעברית בלבד, בתמציתיות.
בסוף הוסף: "⚠️ מידע זה כללי בלבד ואינו מהווה ייעוץ משפטי."`;

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
