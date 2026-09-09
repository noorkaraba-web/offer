import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { getOfferBySlug } from "@/lib/store";
import { findByListingId } from "@/lib/data";
import { getFxRates } from "@/lib/fx";
import { computePricing, formatMoney } from "@/lib/pricing";

// GET /api/offers/{id}/pdf — the "attachment" version of the offer, for
// buyers who prefer a PDF over the link (PRD §5.4).
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const offer = getOfferBySlug(params.id);
  if (!offer) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const rates = await getFxRates();
  const origin = req.nextUrl.origin;

  const cover = pdf.addPage([595, 842]); // A4
  let y = 780;
  cover.drawText("CARNECT OFFER", { x: 50, y, size: 24, font: bold, color: rgb(0.06, 0.24, 0.18) });
  y -= 36;
  cover.drawText(`Prepared for: ${offer.buyer_name}`, { x: 50, y, size: 14, font });
  y -= 20;
  if (offer.buyer_country) {
    cover.drawText(`Destination: ${offer.buyer_country}${offer.destination_port ? " · " + offer.destination_port : ""}`, {
      x: 50,
      y,
      size: 14,
      font,
    });
    y -= 20;
  }
  cover.drawText(`Valid until: ${new Date(offer.expires_at).toDateString()}`, { x: 50, y, size: 14, font });
  y -= 20;
  cover.drawText(`${offer.items.length} vehicle(s)`, { x: 50, y, size: 14, font });

  for (const item of offer.items) {
    const vehicle = await findByListingId(item.listing_id, item.source);
    if (!vehicle) continue;

    const page = pdf.addPage([595, 842]);
    let py = 800;
    page.drawText(vehicle.title_en, { x: 50, y: py, size: 18, font: bold });
    py -= 26;

    try {
      const qs = new URLSearchParams({ id: vehicle.listing_id, ...(vehicle.source ? { source: vehicle.source } : {}) });
      const imgRes = await fetch(`${origin}/api/cards/vehicle?${qs.toString()}`);
      if (imgRes.ok) {
        const bytes = new Uint8Array(await imgRes.arrayBuffer());
        const png = await pdf.embedPng(bytes);
        const w = 495;
        const h = (w / png.width) * png.height;
        page.drawImage(png, { x: 50, y: py - h, width: w, height: h });
        py -= h + 24;
      }
    } catch {
      // Image embed is best-effort; the text summary below still carries the offer.
    }

    const pricing = computePricing(item, offer.currency, rates, Boolean(offer.destination_port));
    page.drawText(`Total: ${formatMoney(pricing.fob_display, offer.currency)}${offer.destination_port ? " (FOB)" : ""}`, {
      x: 50,
      y: py,
      size: 16,
      font: bold,
    });
    py -= 20;
    if (pricing.cfr_display !== null) {
      page.drawText(`Landed (CFR ${offer.destination_port}): ${formatMoney(pricing.cfr_display, offer.currency)}`, {
        x: 50,
        y: py,
        size: 14,
        font,
      });
      py -= 20;
    }
    if (item.note) {
      page.drawText(`Note: ${item.note}`, { x: 50, y: py, size: 12, font, color: rgb(0.3, 0.3, 0.3) });
    }
  }

  const bytes = await pdf.save();
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="carnect-offer-${offer.slug}.pdf"`,
    },
  });
}
