import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { findByListingId } from "@/lib/data";
import { loadOgFonts } from "@/lib/og-fonts";
import { CARD_WIDTH, CARD_HEIGHT, COLORS, CardHeader, CardFooter, tryLoadLogo } from "@/lib/og-card-shared";
import { CardLang, dirFor, t } from "@/lib/i18n/cards";
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
            <div
              style={{
                display: "flex",
                marginTop: 14,
                fontSize: 20,
                fontWeight: 700,
                color: COLORS.red,
                textAlign: rtl ? "right" : "left",
              }}
            >
              ⚠ {t(lang, "structuralDamage")}: {t(lang, "panelsAffected", { n: affected.length })}
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
