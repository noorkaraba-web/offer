import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { loadOgFonts } from "@/lib/og-fonts";
import { CARD_WIDTH, MIN_CARD_HEIGHT, COLORS, CardFooter, tryLoadLogo } from "@/lib/og-card-shared";
import { CardLang, dirFor, t } from "@/lib/i18n/cards";

export const runtime = "edge";

// GET /api/cards/cover?count=&lang= — the catalog-export batch's cover image.
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const lang = (searchParams.get("lang") as CardLang) || "en";
  const count = Number(searchParams.get("count")) || 0;

  const [fonts, logoSrc] = await Promise.all([loadOgFonts(), tryLoadLogo(origin)]);
  const rtl = dirFor(lang) === "rtl";
  const CARD_HEIGHT = MIN_CARD_HEIGHT;

  return new ImageResponse(
    (
      <div
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "Noto Sans, Noto Sans Arabic, Noto Sans KR",
          background: COLORS.bg,
          color: COLORS.text,
          padding: 40,
          direction: rtl ? "rtl" : "ltr",
        }}
      >
        <div style={{ display: "flex", width: "100%" }}>
          {logoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoSrc} height={40} style={{ objectFit: "contain" }} />
          ) : (
            <span style={{ fontSize: 30, fontWeight: 700, color: COLORS.gold, letterSpacing: 3 }}>KARABA</span>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <span style={{ display: "flex", fontSize: 64, fontWeight: 800, color: COLORS.text }}>
            {t(lang, "vehiclesCount", { n: count })}
          </span>
          <span style={{ display: "flex", fontSize: 24, color: COLORS.gold }}>{t(lang, "catalogCoverTagline")}</span>
        </div>

        <div style={{ display: "flex", width: "100%" }}>
          <CardFooter dateLabel={new Date().toLocaleDateString()} />
        </div>
      </div>
    ),
    { width: CARD_WIDTH, height: CARD_HEIGHT, fonts }
  );
}
