import { cardFooterText } from "./brand";

export const CARD_WIDTH = 1200;
// Both card routes compute their own height dynamically (content varies a
// lot — a clean car's inspection report is much shorter than a damaged
// one's full checklist), with 675 as the shared minimum.
export const MIN_CARD_HEIGHT = 675;

/**
 * Card palette — sourced from the user's own Deal Calculator tool
 * (index.html's `:root` CSS variables: --bg, --gold, --green, --red), not
 * invented. "My colours, not Encar's" — this is the closest real evidence
 * of the brand's actual identity available, rather than the generic dark
 * navy this project used before.
 */
export const COLORS = {
  bg: "#1B1E26",
  surface: "#242833",
  surface2: "#2C313D",
  border: "#3A3F4D",
  text: "#E7E9EE",
  muted: "#8B92A3",
  plate: "#D9A441",
  plateText: "#1B1E26",
  green: "#4FAE82",
  red: "#D9685F",
  amber: "#D9A441",
  gold: "#D9A441",
  goldDim: "#A87E36",
};

/**
 * Converts an ArrayBuffer to base64 without spreading it into `btoa`'s
 * argument list (which can blow the call stack on larger files) and without
 * `Buffer` (not available in the edge runtime).
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 8192;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

/**
 * Tries to load the user's logo from the running app's own /logo-white.png
 * (a public/ asset they said exists locally but isn't committed yet) as a
 * data: URL ready to drop into an <img src>. Returns null on any failure so
 * callers can render a text wordmark instead — the card must still work
 * before that file exists in the repo.
 */
export async function tryLoadLogo(origin: string): Promise<string | null> {
  try {
    const res = await fetch(`${origin}/logo-white.png`);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    return `data:image/png;base64,${arrayBufferToBase64(buf)}`;
  } catch {
    return null;
  }
}

/**
 * Logo is pinned physically top-left and the plate badge top-right on
 * *every* card, regardless of language direction — a brand mark's position
 * shouldn't flip with RTL/LTR text flow (explicit ask: "top-left of both
 * cards", not "the start side").
 */
export function CardHeader({ logoSrc, plate }: { logoSrc: string | null; plate: string | null }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        {logoSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoSrc} height={28} style={{ objectFit: "contain" }} />
        ) : (
          <span style={{ fontSize: 22, fontWeight: 700, color: COLORS.gold, letterSpacing: 2 }}>KARABA</span>
        )}
      </div>
      {plate && (
        <div
          style={{
            display: "flex",
            background: COLORS.plate,
            color: COLORS.plateText,
            fontWeight: 700,
            fontSize: 22,
            borderRadius: 8,
            padding: "6px 14px",
          }}
        >
          {plate}
        </div>
      )}
    </div>
  );
}

/** Footer is the same brand bar on every card, in every language — see lib/brand.ts. */
export function CardFooter({ dateLabel }: { dateLabel: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        width: "100%",
        fontSize: 16,
        color: COLORS.muted,
        borderTop: `1px solid ${COLORS.border}`,
        paddingTop: 12,
      }}
    >
      <span style={{ display: "flex" }}>{cardFooterText()}</span>
      <span style={{ display: "flex" }}>{dateLabel}</span>
    </div>
  );
}
