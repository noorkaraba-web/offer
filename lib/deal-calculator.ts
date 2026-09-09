/**
 * Exact port of the standalone "Deal Calculator" tool's `compute()` logic
 * (index.html, provided by the user). Field names and the calculation
 * chain are kept identical on purpose — this is the user's real working
 * formula, not something to "improve" on.
 *
 * One thing worth flagging since it looks like it could be a bug but isn't:
 * `incentivesAmount` is computed and shown as an internal-only info line,
 * but is NOT subtracted from `totalKRW` — the original tool does this too.
 * It's a reference figure for staff (e.g. spiff tracking), not part of the
 * price the buyer is quoted.
 */

export type VatType = "invoice" | "individual" | "notax";
export type DealCurrency = "USD" | "EUR";

export interface DealInputs {
  carPrice: number;
  dealerDc: number;
  /** null = field left empty ("hide this line"), matching the source tool's semantics. */
  auctionFees: number | null;
  vatType: VatType;
  /** 0/10/20/30/40/50/60 — buyer's share of VAT, deducted as "Karaba DC". */
  vatSharePct: number;
  /** Internal-only info figure; not applied to the total. null = hidden. */
  incentivesPct: number | null;
  fee: number | null;
  carrier: number | null;
  shipping: number | null;
  shoring: number | null;
  handling: number | null;
  handlingLabel: string;
  parts: number | null;
  customFee: number | null;
  customFeeLabel: string;
  currency: DealCurrency;
  /** KRW per 1 unit of `currency`. */
  rate: number;
}

export interface DealResult {
  discounted: number;
  vatBase: number;
  vatAmount: number;
  half: number; // "Karaba DC"
  offerPrice: number; // "Vehicle offer price" — vatBase minus Karaba DC
  vatAfterKarabaDC: number;
  incentivesAmount: number | null; // info only, not in totalKRW
  isCIF: boolean;
  totalKRW: number;
  fob: number; // totalKRW converted to `currency` (CFR if isCIF, else FOB)
}

export function computeDeal(inputs: DealInputs): DealResult {
  const discounted = inputs.carPrice - inputs.dealerDc;
  const vatBase = discounted + (inputs.auctionFees ?? 0);

  let vatAmount = 0;
  if (inputs.vatType === "invoice") vatAmount = vatBase / 11;
  else if (inputs.vatType === "individual") vatAmount = vatBase * 0.07;

  const half = vatAmount * (inputs.vatSharePct / 100);
  const offerPrice = vatBase - half;

  const vatAfterKarabaDC = vatAmount - half;
  const incentivesAmount = inputs.incentivesPct !== null ? vatAfterKarabaDC * (inputs.incentivesPct / 100) : null;

  const isCIF = inputs.shipping !== null;

  const totalKRW =
    offerPrice +
    (inputs.fee ?? 0) +
    (inputs.carrier ?? 0) +
    (isCIF ? inputs.shipping! : 0) +
    (inputs.handling ?? 0) +
    (inputs.parts ?? 0) +
    (inputs.customFee ?? 0) +
    (inputs.shoring ?? 0);

  const fob = inputs.rate > 0 ? totalKRW / inputs.rate : 0;

  return { discounted, vatBase, vatAmount, half, offerPrice, vatAfterKarabaDC, incentivesAmount, isCIF, totalKRW, fob };
}

export function fmtKRW(n: number): string {
  return "₩" + Math.round(n || 0).toLocaleString("en-US");
}

const CURRENCY_SYMBOL: Record<string, string> = { USD: "$", EUR: "€" };

export function fmtFX(n: number, currency: string): string {
  const sym = CURRENCY_SYMBOL[currency.toUpperCase()] ?? currency.toUpperCase() + " ";
  return sym + Math.round(n || 0).toLocaleString("en-US");
}

export const DEFAULT_DEAL_INPUTS: Omit<DealInputs, "carPrice" | "rate"> = {
  dealerDc: 0,
  auctionFees: null,
  vatType: "invoice",
  vatSharePct: 50,
  incentivesPct: null,
  fee: null,
  carrier: null,
  shipping: null,
  shoring: null,
  handling: null,
  handlingLabel: "Handling charges",
  parts: null,
  customFee: null,
  customFeeLabel: "Customize Fees",
  currency: "USD",
};
