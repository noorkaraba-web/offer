import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { findByListingId } from "@/lib/data";

export const runtime = "edge";

// GET /api/cards/vehicle?id=&source= — renders the vehicle share card PNG.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const source = searchParams.get("source") ?? undefined;
  if (!id) return new Response("id is required", { status: 400 });

  const vehicle = await findByListingId(id, source);
  if (!vehicle) return new Response("not found", { status: 404 });

  const mileage = vehicle.mileage_km.toLocaleString("en-US");
  const price = vehicle.price_krw.toLocaleString("en-US");
  const heroPhoto = vehicle.photos[0] ?? "https://picsum.photos/seed/no-photo/1200/480";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          fontFamily: "sans-serif",
          background: "#0f3d2e",
        }}
      >
        <div style={{ display: "flex", flex: 1 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroPhoto}
            width={1200}
            height={480}
            style={{ objectFit: "cover" }}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "24px 40px",
            color: "white",
            flex: 1,
            justifyContent: "center",
          }}
        >
          <div style={{ display: "flex", fontSize: 40, fontWeight: 700 }}>
            {vehicle.title_en}
          </div>
          <div style={{ display: "flex", fontSize: 24, color: "#d9a441", marginTop: 8 }}>
            {vehicle.year} · {mileage} km · {vehicle.fuel} · {vehicle.transmission}
          </div>
          <div style={{ display: "flex", fontSize: 32, fontWeight: 700, marginTop: 16 }}>
            ₩{price}
          </div>
          <div style={{ display: "flex", fontSize: 20, marginTop: 12, color: "#cfe3da" }}>
            CARNECT · carnect.biz
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
