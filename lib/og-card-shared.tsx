import { CardLang, dirFor } from "./i18n/cards";

export const CARD_WIDTH = 1200;
export const CARD_HEIGHT = 675;

export const COLORS = {
  bg: "#0a0e1a",
  surface: "#121829",
  surface2: "#181f35",
  border: "#232c44",
  text: "#f2f4f8",
  muted: "#8b93a7",
  plate: "#f2b705",
  plateText: "#1a1305",
  green: "#22c55e",
  red: "#ef4444",
  amber: "#f59e0b",
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

export function CardHeader({
  logoSrc,
  plate,
  lang,
}: {
  logoSrc: string | null;
  plate: string | null;
  lang: CardLang;
}) {
  const rtl = dirFor(lang) === "rtl";
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", order: rtl ? 2 : 1 }}>
        {logoSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoSrc} height={28} style={{ objectFit: "contain" }} />
        ) : (
          <span style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, letterSpacing: 2 }}>CARNECT</span>
        )}
      </div>
      {plate && (
        <div
          style={{
            display: "flex",
            order: rtl ? 1 : 2,
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

export function CardFooter({ tagline, dateLabel }: { tagline: string; dateLabel: string }) {
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
      <span style={{ display: "flex" }}>{tagline}</span>
      <span style={{ display: "flex" }}>{dateLabel}</span>
    </div>
  );
}
