import { notFound } from "next/navigation";
import Image from "next/image";
import { getOfferBySlug, isExpired, recordView } from "@/lib/store";
import { findByListingId } from "@/lib/data";
import { getFxRates } from "@/lib/fx";
import { computePricing, formatMoney } from "@/lib/pricing";
import { OfferItem, Vehicle } from "@/lib/types";

export default async function OfferPublicPage({ params }: { params: { slug: string } }) {
  const offer = getOfferBySlug(params.slug);
  if (!offer) notFound();
  recordView(params.slug);

  const rates = await getFxRates();
  const expired = isExpired(offer);
  const hasDestination = Boolean(offer.destination_port);

  const items: { item: OfferItem; vehicle: Vehicle }[] = [];
  for (const item of offer.items) {
    const vehicle = await findByListingId(item.listing_id, item.source);
    if (vehicle) items.push({ item, vehicle });
  }

  const wholeOfferText = [
    `Carnect offer for ${offer.buyer_name}`,
    ...items.map(({ item, vehicle }) => {
      const p = computePricing(item, offer.currency, rates, hasDestination);
      return `- ${vehicle.title_en}: ${formatMoney(hasDestination ? p.cfr_display! : p.fob_display, offer.currency)}`;
    }),
  ].join("\n");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Offer for {offer.buyer_name}</h1>
        <p className="text-sm text-gray-500">
          {items.length} vehicle{items.length === 1 ? "" : "s"} · Valid until{" "}
          {new Date(offer.expires_at).toDateString()}
        </p>
        {expired && (
          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            This offer has expired. Prices below may no longer be current — contact Carnect to
            reconfirm.
          </p>
        )}
      </div>

      <a
        href={`https://wa.me/?text=${encodeURIComponent(wholeOfferText)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-lg bg-[#25D366] py-3 text-center text-sm font-semibold text-white"
      >
        Share whole offer on WhatsApp
      </a>

      <div className="space-y-4">
        {items.map(({ item, vehicle }) => {
          const pricing = computePricing(item, offer.currency, rates, hasDestination);
          const total = hasDestination ? pricing.cfr_display! : pricing.fob_display;
          const carText = `${vehicle.title_en} — ${formatMoney(total, offer.currency)}\n${vehicle.url}`;

          return (
            <div key={item.listing_id} className="overflow-hidden rounded-xl bg-white shadow-sm">
              <div className="relative aspect-[16/9] w-full bg-gray-200">
                <Image
                  src={vehicle.photos[0]}
                  alt={vehicle.title_en}
                  fill
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h2 className="text-base font-semibold text-gray-900">{vehicle.title_en}</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {vehicle.year} · {vehicle.mileage_km.toLocaleString("en-US")} km · {vehicle.fuel} ·{" "}
                  {vehicle.transmission}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Grade {vehicle.condition.grade} · {vehicle.condition.insurance_record}
                </p>

                {item.show_breakdown && (
                  <ul className="mt-3 space-y-1 text-xs text-gray-500">
                    <li>Vehicle + fees (FOB): {formatMoney(pricing.fob_display, offer.currency)}</li>
                    {pricing.cfr_display !== null && (
                      <li>Freight to {offer.destination_port}: included below</li>
                    )}
                  </ul>
                )}

                <p className="mt-3 text-2xl font-bold text-carnect">
                  {formatMoney(total, offer.currency)}
                  {hasDestination && (
                    <span className="ml-1 text-sm font-normal text-gray-500">
                      CFR {offer.destination_port}
                    </span>
                  )}
                </p>
                {item.note && <p className="mt-2 text-sm text-gray-600">{item.note}</p>}

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(carText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 block rounded-lg bg-[#25D366] py-2 text-center text-sm font-semibold text-white"
                >
                  WhatsApp this car
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
