import { NextRequest, NextResponse } from "next/server";
import { createOffer, listOffers } from "@/lib/store";
import { findByListingId } from "@/lib/data";
import { Currency, OfferItem } from "@/lib/types";

const DEFAULT_EXPIRY_DAYS = 7;
const CURRENCIES: Currency[] = ["USD", "EUR", "AED", "KRW", "JPY", "GBP", "CAD", "AUD"];

// POST /api/offers — create an offer, returns { offer_id, url, pdf_url }
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json(
      { error: "items must be a non-empty array" },
      { status: 400 }
    );
  }
  if (body.items.length > 10) {
    return NextResponse.json(
      { error: "an offer can bundle at most 10 vehicles" },
      { status: 400 }
    );
  }

  const currency: Currency = CURRENCIES.includes(body.currency) ? body.currency : "USD";

  const items: OfferItem[] = [];
  for (const raw of body.items) {
    const vehicle = await findByListingId(raw.listing_id, raw.source);
    if (!vehicle) {
      return NextResponse.json(
        { error: `unknown listing_id: ${raw.listing_id}` },
        { status: 400 }
      );
    }
    items.push({
      listing_id: vehicle.listing_id,
      source: vehicle.source,
      title_en: raw.title_en || vehicle.title_en,
      price_krw: Number(raw.price_krw ?? vehicle.price_krw),
      auction_fee_krw: Number(raw.auction_fee_krw ?? 0),
      carnect_fee_krw: Number(raw.carnect_fee_krw ?? 0),
      inland_krw: Number(raw.inland_krw ?? 0),
      freight_usd: Number(raw.freight_usd ?? 0),
      show_breakdown: raw.show_breakdown !== false,
      note: raw.note || undefined,
    });
  }

  const expiryDays = Number.isFinite(body.expiry_days) ? Number(body.expiry_days) : DEFAULT_EXPIRY_DAYS;
  const expires_at = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString();

  const offer = createOffer({
    buyer_name: body.buyer_name || "Buyer",
    buyer_country: body.buyer_country || undefined,
    destination_port: body.destination_port || undefined,
    currency,
    expires_at,
    items,
  });

  const origin = req.nextUrl.origin;
  return NextResponse.json(
    {
      offer_id: offer.offer_id,
      slug: offer.slug,
      url: `${origin}/offer/${offer.slug}`,
      pdf_url: `${origin}/api/offers/${offer.slug}/pdf`,
    },
    { status: 201 }
  );
}

// GET /api/offers — list sent offers, for the Offer history screen.
export async function GET() {
  return NextResponse.json(listOffers());
}
