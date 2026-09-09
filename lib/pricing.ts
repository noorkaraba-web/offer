import { Currency, FxRates } from "./types";
import { convertFromKrw } from "./fx";

export interface PriceInputs {
  price_krw: number;
  auction_fee_krw: number;
  carnect_fee_krw: number;
  inland_krw: number;
  freight_usd: number;
}

export interface PriceBreakdown {
  fob_krw: number;
  cfr_krw: number | null;
  fob_display: number;
  cfr_display: number | null;
  currency: Currency;
}

export function computeFobKrw(inputs: PriceInputs): number {
  return (
    inputs.price_krw + inputs.auction_fee_krw + inputs.carnect_fee_krw + inputs.inland_krw
  );
}

export function computePricing(
  inputs: PriceInputs,
  currency: Currency,
  rates: FxRates,
  hasDestination: boolean
): PriceBreakdown {
  const fob_krw = computeFobKrw(inputs);
  const freight_krw = inputs.freight_usd / rates.rates.USD;
  const cfr_krw = hasDestination ? fob_krw + freight_krw : null;

  return {
    fob_krw,
    cfr_krw,
    fob_display: convertFromKrw(fob_krw, currency, rates),
    cfr_display: cfr_krw !== null ? convertFromKrw(cfr_krw, currency, rates) : null,
    currency,
  };
}

export function formatMoney(amount: number, currency: Currency): string {
  const fractionDigits = currency === "KRW" || currency === "JPY" ? 0 : 0;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: fractionDigits,
    }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount).toLocaleString("en-US")}`;
  }
}
