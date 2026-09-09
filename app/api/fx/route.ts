import { NextRequest, NextResponse } from "next/server";
import { getFxRates } from "@/lib/fx";

// GET /api/fx?base=KRW — cached FX rates, refreshed hourly.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const base = searchParams.get("base") ?? "KRW";

  if (base !== "KRW") {
    return NextResponse.json(
      { error: "only base=KRW is supported" },
      { status: 400 }
    );
  }

  const rates = await getFxRates();
  return NextResponse.json(rates);
}
