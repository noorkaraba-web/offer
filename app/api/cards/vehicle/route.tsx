import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { findByListingId } from "@/lib/data";
import { loadOgFonts } from "@/lib/og-fonts";
import { CARD_WIDTH, MIN_CARD_HEIGHT, COLORS, CardHeader, CardFooter, tryLoadLogo } from "@/lib/og-card-shared";
import { CardLang, dirFor, t, statusLabel } from "@/lib/i18n/cards";
import { translateTerm } from "@/lib/i18n/condition-terms";
import { Currency } from "@/lib/types";
import { formatMoney } from "@/lib/pricing";
import { getFxRates, convertFromKrw } from "@/lib/fx";

export const runtime = "edge";

// GET /api/cards/vehicle?id=&source=&lang=&currency=&carPrice=&shipping= —
// vehicle share card PNG. `carPrice` is optional: pass it pre-converted
// into `currency` to override the listing price (the single-car share flow
// does this, since staff can edit the price); omit it and this route
// converts the vehicle's own live price_krw itself (the batch/catalog
// export flow does this — no per-car price editing there).
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const id = searchParams.get("id");
  const source = searchParams.get("source") ?? undefined;
  const lang = (searchParams.get("lang") as CardLang) || "en";
  const currency = (searchParams.get("currency") as Currency) || "USD";
  const carPriceParam = searchParams.get("carPrice");
  const shipping = Number(searchParams.get("shipping")) || 0;
  if (!id) return new Response("id is required", { status: 400 });

  const vehicle = await findByListingId(id, source);
  if (!vehicle) return new Response("not found", { status: 404 });

  let carPrice: number;
  if (carPriceParam !== null) {
    carPrice = Number(carPriceParam) || 0;
  } else {
    const rates = await getFxRates().catch(() => null);
    carPrice = rates ? Math.round(convertFromKrw(vehicle.price_krw, currency, rates)) : 0;
  }
  const total = carPrice + shipping;

  const [fonts, logoSrc] = await Promise.all([loadOgFonts(), tryLoadLogo(origin)]);
  const rtl = dirFor(lang) === "rtl";
  const affected = vehicle.condition.panels.filter((p) => p.statusCode !== "normal");

  const photos = vehicle.photos.slice(0, 4);

  // ── Dynamic height: the damage list can wrap across several lines
  // depending on how many panels are affected and how long their
  // translated names are — a fixed height risked clipping it. ──
  const BASE_H = 380; // header + title + specs/VIN + price breakdown + footer
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
          <CardHeader logoSrc={logoSrc} plate={vehicle.plate} />

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
              flexDirection: "column",
              borderRadius: 10,
              background: COLORS.surface2,
              padding: "14px 20px",
              marginBottom: 14,
              gap: 6,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: rtl ? "row-reverse" : "row",
                justifyContent: "space-between",
                fontSize: 15,
                color: COLORS.muted,
              }}
            >
              <span style={{ display: "flex" }}>{t(lang, "carPriceLabel")}</span>
              <span style={{ display: "flex" }}>{formatMoney(carPrice, currency)}</span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: rtl ? "row-reverse" : "row",
                justifyContent: "space-between",
                fontSize: 15,
                color: COLORS.muted,
              }}
            >
              <span style={{ display: "flex" }}>{t(lang, "shippingCostLabel")}</span>
              <span style={{ display: "flex" }}>{formatMoney(shipping, currency)}</span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: rtl ? "row-reverse" : "row",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: `1px solid ${COLORS.border}`,
                marginTop: 4,
                paddingTop: 10,
              }}
            >
              <span style={{ display: "flex", fontSize: 18, color: COLORS.gold, fontWeight: 600 }}>
                {t(lang, "priceIncludingDelivery")}
              </span>
              <span style={{ display: "flex", fontSize: 30, fontWeight: 700, color: COLORS.gold }}>
                {formatMoney(total, currency)}
              </span>
            </div>
          </div>
          <CardFooter dateLabel={new Date().toLocaleDateString()} />
        </div>
      </div>
    ),
    { width: CARD_WIDTH, height: CARD_HEIGHT, fonts }
  );
}
