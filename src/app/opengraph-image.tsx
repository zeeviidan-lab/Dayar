import { ImageResponse } from "next/og";
import { LOGO_DATA_URI } from "./logo-b64";

// Share-preview card (Open Graph) for the whole site — what people see
// when a link to hadayar.co.il is shared on WhatsApp/Facebook.

export const alt = "דַּיָּר — פלטפורמת ביקורות הדיירים של ישראל";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadHeebo(weight: number): Promise<ArrayBuffer> {
  // Old-browser user agent makes Google Fonts serve TTF (satori can't read woff2)
  const css = await fetch(`https://fonts.googleapis.com/css2?family=Heebo:wght@${weight}`, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 6.1; rv:20.0) Gecko/20100101 Firefox/20.0" },
  }).then((r) => r.text());
  const url = css.match(/src: url\((.+?)\)/)?.[1];
  if (!url) throw new Error("font not found");
  return fetch(url).then((r) => r.arrayBuffer());
}

// The OG renderer draws text left-to-right only — reverse Hebrew strings
// by grapheme cluster so letters keep their nikud marks attached.
function rtl(s: string): string {
  const seg = new Intl.Segmenter("he", { granularity: "grapheme" });
  return [...seg.segment(s)].map((g) => g.segment).reverse().join("");
}

function Star() {
  return (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="#ffedd5">
      <path d="M12 2l2.9 6.26 6.86.6-5.2 4.52 1.55 6.72L12 16.54 5.89 20.1l1.55-6.72-5.2-4.52 6.86-.6L12 2z" />
    </svg>
  );
}

export default async function Image() {
  const [heeboBold, heeboRegular] = await Promise.all([loadHeebo(800), loadHeebo(400)]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f97316",
          fontFamily: "Heebo",
        }}
      >
        {/* The logo דַּיָּר rendered by a real browser text engine (the OG
            renderer can't stack nikud marks) — embedded as an image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO_DATA_URI} alt="" width={620} height={289} style={{ marginTop: -40, marginBottom: -40 }} />
        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          <Star /><Star /><Star /><Star /><Star />
        </div>
        <div style={{ fontSize: 44, fontWeight: 400, color: "#fff", marginTop: 28 }}>
          {rtl("ביקורות דיירים על כל כתובת בישראל")}
        </div>
        <div
          style={{
            marginTop: 44,
            fontSize: 30,
            color: "#f97316",
            background: "#fff",
            padding: "12px 36px",
            borderRadius: 999,
            fontWeight: 800,
          }}
        >
          hadayar.co.il
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Heebo", data: heeboBold, weight: 800 },
        { name: "Heebo", data: heeboRegular, weight: 400 },
      ],
    }
  );
}
