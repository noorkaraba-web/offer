import { NextRequest, NextResponse } from "next/server";
import { findByListingId } from "@/lib/data";

// POST /api/cards/render — returns PNG URLs for the vehicle + condition cards.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const id = body?.listing_id ?? body?.id;
  const source = body?.source;

  if (!id) {
    return NextResponse.json({ error: "listing_id is required" }, { status: 400 });
  }
  if (!findByListingId(id, source)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const origin = req.nextUrl.origin;
  const qs = new URLSearchParams({ id, ...(source ? { source } : {}) }).toString();

  return NextResponse.json({
    vehicle_card_url: `${origin}/api/cards/vehicle?${qs}`,
    condition_card_url: `${origin}/api/cards/condition?${qs}`,
  });
}
