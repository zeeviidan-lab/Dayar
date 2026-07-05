"use client";

// Cloudflare Turnstile — client side.
// A single persistent widget serves all protected calls: the first token may
// require an interactive check; after that, clearance is remembered and
// subsequent tokens are issued silently (no repeated captchas).
// When Cloudflare does need interaction, the widget is shown centered in a
// clearly-labeled overlay instead of floating detached at the page bottom.

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id: string) => void;
      remove: (id: string) => void;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "0x4AAAAAADwHhS5bpRw4vDIr";

let widgetId: string | null = null;
let overlayEl: HTMLElement | null = null;
let widgetHost: HTMLElement | null = null;
const pending: ((token: string) => void)[] = [];

function ensureOverlay(): HTMLElement {
  if (widgetHost) return widgetHost;

  overlayEl = document.createElement("div");
  overlayEl.id = "cf-turnstile-overlay";
  overlayEl.setAttribute("dir", "rtl");
  Object.assign(overlayEl.style, {
    position: "fixed", inset: "0", zIndex: "400",
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "rgba(0,0,0,0.55)",
    opacity: "0", pointerEvents: "none", transition: "opacity 0.2s",
  });

  const card = document.createElement("div");
  Object.assign(card.style, {
    background: "#fff", borderRadius: "16px", padding: "20px 24px",
    boxShadow: "0 8px 40px rgba(0,0,0,0.25)", textAlign: "center",
    fontFamily: "inherit", maxWidth: "90vw",
  });

  const title = document.createElement("p");
  title.textContent = "רגע אחד — נוודא שאינך רובוט 🤖";
  Object.assign(title.style, { margin: "0 0 12px", fontWeight: "700", fontSize: "15px", color: "#111" });

  widgetHost = document.createElement("div");

  card.appendChild(title);
  card.appendChild(widgetHost);
  overlayEl.appendChild(card);
  document.body.appendChild(overlayEl);
  return widgetHost;
}

function showOverlay() {
  if (overlayEl) {
    overlayEl.style.opacity = "1";
    overlayEl.style.pointerEvents = "auto";
  }
}

function hideOverlay() {
  if (overlayEl) {
    overlayEl.style.opacity = "0";
    overlayEl.style.pointerEvents = "none";
  }
}

function settle(token: string) {
  hideOverlay();
  const resolve = pending.shift();
  resolve?.(token);
}

export function getTurnstileToken(): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.turnstile) {
      resolve(""); // script not loaded — server decides whether to allow
      return;
    }

    pending.push(resolve);

    if (widgetId !== null) {
      // Reuse the existing widget: reset issues a fresh token, silently when
      // the visitor already has clearance.
      try {
        window.turnstile.reset(widgetId);
      } catch {
        settle("");
      }
      return;
    }

    const host = ensureOverlay();
    widgetId = window.turnstile.render(host, {
      sitekey: SITE_KEY,
      appearance: "interaction-only",
      callback: (token: string) => settle(token),
      "error-callback": () => settle(""),
      "timeout-callback": () => settle(""),
      "expired-callback": () => { /* next getToken() will reset */ },
      "before-interactive-callback": () => showOverlay(),
    });
    if (widgetId === null) settle("");
  });
}
