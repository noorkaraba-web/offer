import { NextRequest, NextResponse } from "next/server";
import { findByListingId, findByPlate } from "@/lib/data";

// GET /api/lookup?plate={plate}
// GET /api/lookup?id={listing_id}&source={encar|heydealer}
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const plate = searchParams.get("plate");
  const id = searchParams.get("id");
  const source = searchParams.get("source") ?? undefined;

  if (!plate && !id) {
    return NextResponse.json(
      { error: "Provide either ?plate= or ?id=" },
      { status: 400 }
    );
  }

  const vehicle = plate ? await findByPlate(plate) : await findByListingId(id!, source);

  if (!vehicle) {
    return NextResponse.json(
      { error: "not_found", query: plate ? { plate } : { id, source } },
      { status: 404 }
    );
  }

  return NextResponse.json(vehicle, {
    headers: { "Cache-Control": "public, max-age=0, s-maxage=21600" }, // 6h per PRD §8
  });
}
