import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { findByListingId } from "@/lib/data";

export const runtime = "edge";

// GET /api/cards/condition?id=&source= — renders the condition share card PNG.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const source = searchParams.get("source") ?? undefined;
  if (!id) return new Response("id is required", { status: 400 });

  const vehicle = findByListingId(id, source);
  if (!vehicle) return new Response("not found", { status: 404 });

  const rows: [string, string][] = [
    ["Insurance record", vehicle.condition.insurance_record],
    ["Diagnosis", vehicle.condition.diagnosis],
    ["Inspection", vehicle.condition.inspection],
    ["Owner changes", String(vehicle.condition.owner_changes)],
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          fontFamily: "sans-serif",
          background: "#ffffff",
          padding: "48px",
        }}
      >
        <div style={{ display: "flex", fontSize: 32, fontWeight: 700, color: "#0f3d2e" }}>
          {vehicle.title_en}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: 20,
            fontSize: 28,
            fontWeight: 700,
            color: "white",
            background:
              vehicle.condition.grade === "A"
                ? "#15533e"
                : vehicle.condition.grade === "B"
                ? "#d9a441"
                : "#a83232",
            borderRadius: 12,
            padding: "8px 20px",
            width: "fit-content",
          }}
        >
          Grade {vehicle.condition.grade}
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 32 }}>
          {rows.map(([label, value]) => (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 26,
                padding: "14px 0",
                borderBottom: "1px solid #e5e5e5",
                color: "#1a1a1a",
              }}
            >
              <span style={{ color: "#666666" }}>{label}</span>
              <span style={{ fontWeight: 600 }}>{value}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", fontSize: 20, marginTop: 32, color: "#666666" }}>
          CARNECT · carnect.biz
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
