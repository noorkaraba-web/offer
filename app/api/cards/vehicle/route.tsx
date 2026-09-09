import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { findByListingId } from "@/lib/data";
import { loadOgFonts } from "@/lib/og-fonts";
import { CARD_WIDTH, MIN_CARD_HEIGHT, COLORS, CardHeader, CardFooter, tryLoadLogo } from "@/lib/og-card-shared";
import { CardLang, dirFor, t, statusLabel } from "@/lib/i18n/cards";
import { translateTerm } from "@/lib/i18n/condition-terms";
import { Currency } from "@/lib/types";
import { formatMoney } from "@/lib/pricing";

export const runtime = "edge";

// GET /api/cards/vehicle?id=&source=&lang=&currency=&landedPrice= — vehicle share card PNG.
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const id = searchParams.get("id");
  const source = searchParams.get("source") ?? undefined;
  const lang = (searchParams.get("lang") as CardLang) || "en";
  const currency = (searchParams.get("currency") as Currency) || "USD";
  const landedPrice = Number(searchParams.get("landedPrice")) || 0;
  if (!id) return new Response("id is required", { status: 400 });

  const vehicle = await findByListingId(id, source);
  if (!vehicle) return new Response("not found", { status: 404 });

  const [fonts, logoSrc] = await Promise.all([loadOgFonts(), tryLoadLogo(origin)]);
  const rtl = dirFor(lang) === "rtl";
  const affected = vehicle.condition.panels.filter((p) => p.statusCode !== "normal");

  const photos = vehicle.photos.slice(0, 4);

  // ── Dynamic height: the damage list can wrap across several lines
  // depending on how many panels are affected and how long their
  // translated names are — a fixed height risked clipping it. ──
  const BASE_H = 330; // header + title + specs/VIN + price banner + footer
  const PHOTOS_H = photos.length > 0 ? 175 : 0;
  const DAMAGE_H = affected.length > 0 ? 50 + Math.ceil(affected.length / 3) * 26 : 0;
  const CARD_HEIGHT = Math.max(MIN_CARD_HEIGHT, BASE_H + PHOTOS_H + DAMAGE_H);

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
              fontSize: 34,
              fontWeight: 700,
              marginTop: 20,
              textAlign: rtl ? "right" : "left",
            }}
          >
            {vehicle.title_en}
          </div>

          {photos.length > 0 && (
            <div style={{ display: "flex", flexDirection: rtl ? "row-reverse" : "row", gap: 10, marginTop: 16 }}>
              {photos.map((p) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={p}
                  src={p}
                  width={265}
                  height={165}
                  style={{ objectFit: "cover", borderRadius: 10 }}
                />
              ))}
            </div>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: rtl ? "row-reverse" : "row",
              gap: 24,
              marginTop: 18,
              fontSize: 20,
              color: COLORS.muted,
            }}
          >
            <span style={{ display: "flex" }}>{t(lang, "regDate")}: {vehicle.reg_date || vehicle.year}</span>
            <span style={{ display: "flex" }}>
              {t(lang, "mileage")}: {vehicle.mileage_km.toLocaleString("en-US")} km
            </span>
          </div>
          {vehicle.vin && (
            <div style={{ display: "flex", marginTop: 6, fontSize: 18, color: COLORS.muted }}>
              {t(lang, "vin")}: {vehicle.vin}
            </div>
          )}

          {affected.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", marginTop: 14 }}>
              <div
                style={{
                  display: "flex",
                  fontSize: 20,
                  fontWeight: 700,
                  color: COLORS.red,
                  textAlign: rtl ? "right" : "left",
                }}
              >
                ⚠ {t(lang, "structuralDamage")}
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  flexDirection: rtl ? "row-reverse" : "row",
                  gap: 6,
                  marginTop: 4,
                  fontSize: 15,
                  color: COLORS.muted,
                }}
              >
                {affected.map((p, i) => (
                  <span key={`${p.rawName}-${i}`} style={{ display: "flex" }}>
                    {translateTerm(lang, p.rawName)} ({statusLabel(lang, p.statusCode)})
                    {i < affected.length - 1 ? " •" : ""}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
          <div
            style={{
              display: "flex",
              flexDirection: rtl ? "row-reverse" : "row",
              justifyContent: "space-between",
              alignItems: "center",
              background: COLORS.green,
              borderRadius: 10,
              padding: "14px 20px",
              marginBottom: 14,
            }}
          >
            <span style={{ display: "flex", fontSize: 18, color: "#052e16", fontWeight: 600 }}>
              {t(lang, "landedPrice")}
            </span>
            <span style={{ display: "flex", fontSize: 30, fontWeight: 700, color: "#052e16" }}>
              {formatMoney(landedPrice, currency)}
            </span>
          </div>
          <CardFooter tagline={`${t(lang, "brand")} · ${t(lang, "footerTagline")}`} dateLabel={new Date().toLocaleDateString()} />
        </div>
      </div>
    ),
    { width: CARD_WIDTH, height: CARD_HEIGHT, fonts }
  );
}
