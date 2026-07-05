"use client";

// Cloudflare Turnstile — client side.
// getTurnstileToken() returns a fresh single-use token for a protected API call.
// The widget is invisible for normal users ("interaction-only"); if Cloudflare
// decides a challenge is needed it appears in a fixed container at the bottom.

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      remove: (id: string) => void;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "0x4AAAAAADwHhS5bpRw4vDIr";

let widgetId: string | null = null;

function container(): HTMLElement {
  let el = document.getElementById("cf-turnstile-container");
  if (!el) {
    el = document.createElement("div");
    el.id = "cf-turnstile-container";
    el.style.position = "fixed";
    el.style.bottom = "90px";
    el.style.left = "50%";
    el.style.transform = "translateX(-50%)";
    el.style.zIndex = "300";
    document.body.appendChild(el);
  }
  return el;
}

export function getTurnstileToken(): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.turnstile) {
      resolve(""); // script not loaded — server decides whether to allow
      return;
    }
    const el = container();
    if (widgetId !== null) {
      try { window.turnstile.remove(widgetId); } catch { /* already gone */ }
      widgetId = null;
    }
    widgetId = window.turnstile.render(el, {
      sitekey: SITE_KEY,
      appearance: "interaction-only",
      callback: (token: string) => resolve(token),
      "error-callback": () => resolve(""),
      "timeout-callback": () => resolve(""),
    });
    if (widgetId === null) resolve("");
  });
}
