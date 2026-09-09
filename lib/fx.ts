import { Currency, FxRates } from "./types";

// Static fallback, KRW-based. Used when the live source is unreachable and
// as a same-process seed so the app works offline / in restricted sandboxes.
const STATIC_RATES: Record<Currency, number> = {
  KRW: 1,
  USD: 1 / 1350,
  EUR: 1 / 1460,
  AED: 1 / 367.5,
  JPY: 1 / 8.9,
  GBP: 1 / 1710,
  CAD: 1 / 985,
  AUD: 1 / 890,
};

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour, per PRD §5.2 "live FX"

let cache: FxRates | null = null;
let cacheAt = 0;

export async function getFxRates(): Promise<FxRates> {
  const now = Date.now();
  if (cache && now - cacheAt < CACHE_TTL_MS) {
    return cache;
  }

  const live = await fetchLiveRates();
  cache = live ?? {
    base: "KRW",
    rates: STATIC_RATES,
    updated_at: new Date().toISOString(),
    source: "static-fallback",
  };
  cacheAt = now;
  return cache;
}

async function fetchLiveRates(): Promise<FxRates | null> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/KRW", {
      // Next.js fetch cache: we manage our own TTL above.
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.result !== "success" || !json.rates) return null;

    const rates: Record<Currency, number> = { ...STATIC_RATES };
    (Object.keys(STATIC_RATES) as Currency[]).forEach((cur) => {
      if (typeof json.rates[cur] === "number") {
        rates[cur] = json.rates[cur];
      }
    });

    return {
      base: "KRW",
      rates,
      updated_at: new Date().toISOString(),
      source: "live",
    };
  } catch {
    return null;
  }
}

export function convertFromKrw(amountKrw: number, currency: Currency, rates: FxRates): number {
  return amountKrw * rates.rates[currency];
}
