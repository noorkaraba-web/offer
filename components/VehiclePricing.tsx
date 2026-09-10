"use client";

import { useEffect, useState } from "react";
import { Vehicle, FxRates } from "@/lib/types";
import { convertFromKrw } from "@/lib/fx";
import { formatMoney } from "@/lib/pricing";
import { useOfferDraft } from "@/lib/offer-draft-context";
import ShareToWhatsAppBlock from "./ShareToWhatsAppBlock";

/**
 * Simple FOB price + WhatsApp share, replacing the earlier Deal Calculator
 * port — not wanted in this buyer-facing app. Just one editable price field,
 * pre-filled from the listing, feeding both "Add to offer" and the share cards.
 */
export default function VehiclePricing({ vehicle }: { vehicle: Vehicle }) {
  const [fobPriceKrw, setFobPriceKrw] = useState(vehicle.price_krw);
  const [rates, setRates] = useState<FxRates | null>(null);

  const { addItem, updateItem, removeItem, hasItem } = useOfferDraft();
  const added = hasItem(vehicle.listing_id);

  useEffect(() => {
    fetch("/api/fx?base=KRW")
      .then((r) => r.json())
      .then(setRates)
      .catch(() => setRates(null));
  }, []);

  function toOfferItem() {
    return {
      listing_id: vehicle.listing_id,
      source: vehicle.source,
      title_en: vehicle.title_en,
      price_krw: fobPriceKrw,
      auction_fee_krw: 0,
      carnect_fee_krw: 0,
      inland_krw: 0,
      freight_usd: 0,
      show_breakdown: false,
    };
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-navy-border bg-navy-surface p-4">
        <h3 className="text-sm font-semibold text-navy-text">FOB price</h3>
        <label className="mt-3 block text-xs uppercase tracking-wide text-navy-muted">FOB price (KRW)</label>
        <input
          type="number"
          value={fobPriceKrw}
          onChange={(e) => setFobPriceKrw(Number(e.target.value) || 0)}
          className="mt-1 w-full rounded-md border border-navy-border bg-navy-surface2 px-3 py-2 text-sm text-navy-text"
        />
        {rates && (
          <p className="mt-2 text-sm text-navy-muted">
            {formatMoney(convertFromKrw(fobPriceKrw, "USD", rates), "USD")} ·{" "}
            {formatMoney(convertFromKrw(fobPriceKrw, "EUR", rates), "EUR")}
          </p>
        )}

        <button
          onClick={() => (added ? updateItem(vehicle.listing_id, toOfferItem()) : addItem(toOfferItem()))}
          className="mt-4 w-full rounded-lg bg-carnect py-2.5 text-sm font-semibold text-white"
        >
          {added ? "Update in offer" : "Add to offer"}
        </button>
        {added && (
          <button
            onClick={() => removeItem(vehicle.listing_id)}
            className="mt-2 w-full rounded-lg border border-navy-border py-2 text-sm text-navy-muted"
          >
            Remove from offer
          </button>
        )}
      </div>

      <ShareToWhatsAppBlock vehicle={vehicle} fobPriceKrw={fobPriceKrw} />
    </div>
  );
}
