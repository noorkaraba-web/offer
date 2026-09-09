"use client";

import { useEffect, useState } from "react";
import { Vehicle, Currency, FxRates } from "@/lib/types";
import { computePricing, formatMoney } from "@/lib/pricing";
import { useOfferDraft } from "@/lib/offer-draft-context";

const CURRENCIES: Currency[] = ["USD", "EUR", "AED", "KRW", "JPY", "GBP", "CAD", "AUD"];

export default function PriceBuilder({ vehicle }: { vehicle: Vehicle }) {
  const [priceKrw, setPriceKrw] = useState(vehicle.price_krw);
  const [auctionFee, setAuctionFee] = useState(0);
  const [carnectFee, setCarnectFee] = useState(0);
  const [inland, setInland] = useState(0);
  const [destinationPort, setDestinationPort] = useState("");
  const [freightUsd, setFreightUsd] = useState(0);
  const [currency, setCurrency] = useState<Currency>("USD");
  const [showBreakdown, setShowBreakdown] = useState(true);
  const [rates, setRates] = useState<FxRates | null>(null);
  const [rateError, setRateError] = useState(false);

  const { addItem, updateItem, removeItem, hasItem } = useOfferDraft();
  const added = hasItem(vehicle.listing_id);

  useEffect(() => {
    fetch("/api/fx?base=KRW")
      .then((r) => r.json())
      .then(setRates)
      .catch(() => setRateError(true));
  }, []);

  const inputs = {
    price_krw: priceKrw,
    auction_fee_krw: auctionFee,
    carnect_fee_krw: carnectFee,
    inland_krw: inland,
    freight_usd: freightUsd,
  };

  const pricing = rates
    ? computePricing(inputs, currency, rates, destinationPort.trim().length > 0)
    : null;

  function toOfferItem() {
    return {
      listing_id: vehicle.listing_id,
      source: vehicle.source,
      title_en: vehicle.title_en,
      price_krw: priceKrw,
      auction_fee_krw: auctionFee,
      carnect_fee_krw: carnectFee,
      inland_krw: inland,
      freight_usd: freightUsd,
      show_breakdown: showBreakdown,
    };
  }

  return (
    <div className="rounded-xl border border-navy-border bg-navy-surface p-4">
      <h3 className="mb-3 text-sm font-semibold text-navy-text">Offer price builder</h3>

      <div className="grid grid-cols-2 gap-3">
        <NumberField label="Vehicle price (KRW)" value={priceKrw} onChange={setPriceKrw} />
        <NumberField label="Auction / purchase fee (KRW)" value={auctionFee} onChange={setAuctionFee} />
        <NumberField label="Carnect fee (KRW)" value={carnectFee} onChange={setCarnectFee} />
        <NumberField label="Inland transport (KRW)" value={inland} onChange={setInland} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs uppercase tracking-wide text-navy-muted">Destination port</label>
          <input
            value={destinationPort}
            onChange={(e) => setDestinationPort(e.target.value)}
            placeholder="Optional"
            className="mt-1 w-full rounded-md border border-navy-border bg-navy-surface2 px-2 py-1.5 text-sm text-navy-text"
          />
        </div>
        <NumberField label="Freight (USD)" value={freightUsd} onChange={setFreightUsd} />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value as Currency)}
          className="rounded-md border border-navy-border bg-navy-surface2 px-2 py-1.5 text-sm text-navy-text"
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-navy-muted">
          <input
            type="checkbox"
            checked={showBreakdown}
            onChange={(e) => setShowBreakdown(e.target.checked)}
          />
          Show breakdown
        </label>
      </div>

      <div className="mt-4 rounded-lg bg-navy-surface2 p-3">
        {!rates && !rateError && <p className="text-sm text-navy-muted">Loading FX rates…</p>}
        {rateError && <p className="text-sm text-red-400">FX rates unavailable — try again shortly.</p>}
        {pricing && (
          <>
            {showBreakdown && (
              <ul className="mb-2 space-y-1 text-xs text-navy-muted">
                <li>Vehicle: {formatMoney((priceKrw) * (rates!.rates[currency]), currency)}</li>
                <li>Auction fee: {formatMoney(auctionFee * rates!.rates[currency], currency)}</li>
                <li>Carnect fee: {formatMoney(carnectFee * rates!.rates[currency], currency)}</li>
                <li>Inland: {formatMoney(inland * rates!.rates[currency], currency)}</li>
                {pricing.cfr_display !== null && (
                  <li>Freight: {formatMoney(freightUsd * (rates!.rates[currency] / rates!.rates.USD), currency)}</li>
                )}
              </ul>
            )}
            <p className="text-lg font-bold text-navy-text">
              FOB: {formatMoney(pricing.fob_display, currency)}
            </p>
            {pricing.cfr_display !== null && (
              <p className="text-lg font-bold text-carnect-accent">
                CFR {destinationPort}: {formatMoney(pricing.cfr_display, currency)}
              </p>
            )}
          </>
        )}
      </div>

      <button
        onClick={() => {
          if (added) {
            updateItem(vehicle.listing_id, toOfferItem());
          } else {
            addItem(toOfferItem());
          }
        }}
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
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wide text-navy-muted">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="mt-1 w-full rounded-md border border-navy-border bg-navy-surface2 px-2 py-1.5 text-sm text-navy-text"
      />
    </div>
  );
}
