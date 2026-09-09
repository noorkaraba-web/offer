import { NextRequest, NextResponse } from "next/server";
import { getOfferBySlug, isExpired, recordView } from "@/lib/store";
import { findByListingId } from "@/lib/data";

// GET /api/offers/{id} — buyer-facing offer payload (id = slug).
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const offer = getOfferBySlug(params.id);
  if (!offer) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  recordView(params.id);

  const items = offer.items.map((item) => ({
    ...item,
    vehicle: findByListingId(item.listing_id),
  }));

  return NextResponse.json({
    ...offer,
    items,
    expired: isExpired(offer),
  });
}
