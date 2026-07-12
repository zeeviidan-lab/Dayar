import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Screens review text against the platform policy. The site's agenda is
// free speech + transparency: honest negative reviews are the whole point
// and must pass. We only block clearly abusive content — profanity, hate
// speech, slurs, threats, sexual harassment, or doxxing (phone/ID).
//
// Fail-OPEN: if the check errors or times out, the review is allowed. We
// never block a legitimate review because moderation was unavailable.
export async function moderateReview(text: string): Promise<{ allowed: boolean; reason: string }> {
  const trimmed = text.trim();
  if (trimmed.length < 3) return { allowed: true, reason: "" };
  if (!process.env.ANTHROPIC_API_KEY) return { allowed: true, reason: "" };

  try {
    const response = await client.messages.create(
      {
        model: "claude-haiku-4-5-20251001",
        max_tokens: 20,
        system: `אתה מנחה תוכן לאתר ביקורות דיירים על דירות ומשכירים. חופש הביטוי הוא ערך מרכזי — ביקורות שליליות, ביקורתיות וחריפות על דירה או משכיר הן לגיטימיות ותמיד מותרות.
חסום ביקורת רק אם היא מכילה: קללות ושפה בוטה, גזענות או הסתה, איומים, הטרדה מינית, או פרטים אישיים (טלפון/ת"ז).
ענה במילה אחת בלבד: "ALLOW" אם התוכן תקין, או "BLOCK" אם הוא מפר את הכללים.`,
        messages: [{ role: "user", content: trimmed.slice(0, 2000) }],
      },
      { timeout: 8000 }
    );
    const out = response.content[0];
    const verdict = out.type === "text" ? out.text.trim().toUpperCase() : "";
    if (verdict.startsWith("BLOCK")) {
      return { allowed: false, reason: "הביקורת מכילה שפה או תוכן שאינם עומדים בכללי הקהילה. נסחו מחדש בלשון מכבדת ונסו שוב." };
    }
    return { allowed: true, reason: "" };
  } catch {
    return { allowed: true, reason: "" }; // fail-open
  }
}
