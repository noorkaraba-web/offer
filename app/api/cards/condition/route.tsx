import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { findByListingId } from "@/lib/data";
import { loadOgFonts } from "@/lib/og-fonts";
import { CARD_WIDTH, CARD_HEIGHT, COLORS, CardHeader, CardFooter, tryLoadLogo } from "@/lib/og-card-shared";
import { CardLang, dirFor, t, statusLabel } from "@/lib/i18n/cards";

export const runtime = "edge";

const MAX_ROWS = 7;
const STATUS_DOT_COLOR: Record<string, string> = {
  normal: COLORS.green,
  replaced: COLORS.red,
  welded: COLORS.amber,
  corrosion: COLORS.amber,
  unknown: COLORS.muted,
};

// GET /api/cards/condition?id=&source=&lang= — inspection report share card PNG.
// Note: this is the "Inspection report" card in the redesigned share flow
// (route path kept as /cards/condition for backwards compatibility).
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const id = searchParams.get("id");
  const source = searchParams.get("source") ?? undefined;
  const lang = (searchParams.get("lang") as CardLang) || "en";
  if (!id) return new Response("id is required", { status: 400 });

  const vehicle = await findByListingId(id, source);
  if (!vehicle) return new Response("not found", { status: 404 });

  const [fonts, logoSrc] = await Promise.all([loadOgFonts(), tryLoadLogo(origin)]);
  const rtl = dirFor(lang) === "rtl";

  const affected = vehicle.condition.panels.filter((p) => p.statusCode !== "normal");
  const normal = vehicle.condition.panels.filter((p) => p.statusCode === "normal");
  const rows = [...affected, ...normal].slice(0, MAX_ROWS);

  const summaryCells: [string, string][] = [
    [t(lang, "grade"), vehicle.condition.grade],
    [t(lang, "insuranceRecord"), vehicle.condition.insurance_record],
    [t(lang, "diagnosis"), vehicle.condition.diagnosis],
    [t(lang, "inspection"), vehicle.condition.inspection],
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily: "Noto Sans, Noto Sans Arabic, Noto Sans KR",
          background: COLORS.bg,
          color: COLORS.text,
          padding: 40,
          direction: rtl ? "rtl" : "ltr",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
          <CardHeader logoSrc={logoSrc} plate={vehicle.plate} lang={lang} />

          <div
            style={{
              display: "flex",
              fontSize: 30,
              fontWeight: 700,
              marginTop: 18,
              textAlign: rtl ? "right" : "left",
            }}
          >
            {t(lang, "inspectionReportTitle")} — {vehicle.title_en}
          </div>

          <div style={{ display: "flex", flexDirection: rtl ? "row-reverse" : "row", gap: 10, marginTop: 16 }}>
            {summaryCells.map(([label, value]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  background: COLORS.surface2,
                  borderRadius: 8,
                  padding: "10px 14px",
                }}
              >
                <span style={{ display: "flex", fontSize: 14, color: COLORS.muted, textTransform: "uppercase" }}>
                  {label}
                </span>
                <span style={{ display: "flex", fontSize: 16, fontWeight: 600, marginTop: 2 }}>{value}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", marginTop: 16, gap: 8 }}>
            {rows.map((panel, i) => (
              <div
                key={`${panel.name}-${i}`}
                style={{
                  display: "flex",
                  flexDirection: rtl ? "row-reverse" : "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: COLORS.surface2,
                  borderRadius: 8,
                  padding: "10px 16px",
                }}
              >
                <span style={{ display: "flex", fontSize: 18 }}>{panel.name}</span>
                <div style={{ display: "flex", flexDirection: rtl ? "row-reverse" : "row", alignItems: "center", gap: 8 }}>
                  <span style={{ display: "flex", fontSize: 16, color: COLORS.muted }}>
                    {statusLabel(lang, panel.statusCode)}
                  </span>
                  <span
                    style={{
                      display: "flex",
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      background: STATUS_DOT_COLOR[panel.statusCode] ?? COLORS.muted,
                    }}
                  />
                </div>
              </div>
            ))}
            {rows.length === 0 && (
              <div style={{ display: "flex", fontSize: 18, color: COLORS.muted }}>{t(lang, "notAvailable")}</div>
            )}
          </div>
        </div>

        <CardFooter tagline={`${t(lang, "brand")} · ${t(lang, "footerTagline")}`} dateLabel={new Date().toLocaleDateString()} />
      </div>
    ),
    { width: CARD_WIDTH, height: CARD_HEIGHT, fonts }
  );
}
