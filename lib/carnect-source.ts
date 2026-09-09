import { Currency, Source, Vehicle, VehicleCondition } from "./types";

/**
 * Live fetcher for carnect.biz's own public pages, used in place of a
 * crawler DB per the "no dev, no DB access yet" constraint. Confirmed by
 * hand against real page dumps (see repo history / README):
 *
 *  - `supercar` listing pages: fully parsed and verified — brand, model,
 *    year, USD + KRW price, 7 specs, full photo gallery.
 *  - `encar` / `heydealer` listing pages: NOT verified against a real
 *    sample. The parser below reuses the same selectors (the site's `ta-`
 *    prefixed classes look like a shared design system used across
 *    templates), but if a real page doesn't match, `parseListingHtml`
 *    returns null and the caller (lib/data.ts) falls back to mock data —
 *    it never surfaces a garbled record.
 *  - Catalog pages (`/catalog`, `/catalog?tab=encar`): fully parsed and
 *    verified — used for the plate-search fallback below.
 *  - Plate search: the catalog has a real "License plate" search box, but
 *    it's wired to client JS with no visible endpoint in the static HTML.
 *    `fetchLivePlateSearch` guesses `?tab=encar&plate=<value>` (the
 *    obvious param name, matching our own API's own `?plate=` convention)
 *    against the catalog page and parses whatever comes back. If that
 *    guess is wrong, zero cards are found and lib/data.ts falls back to
 *    mock data — same safe-degrade behavior.
 */

const BASE_URL = "https://carnect.biz";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6h, per PRD §8 "all lookups cached 6 hours"
const FETCH_TIMEOUT_MS = 8000;

interface CacheEntry {
  html: string;
  expiresAt: number;
}

const htmlCache = new Map<string, CacheEntry>();
// Dedupes concurrent requests for the same URL so a burst of clicks doesn't
// fan out into a burst of requests to carnect.biz. Only successful fetches
// are persisted into htmlCache (below) — a failure isn't remembered, so a
// transient blip doesn't poison lookups for the full 6h TTL.
const inFlight = new Map<string, Promise<string | null>>();

async function fetchHtml(url: string): Promise<string | null> {
  const cached = htmlCache.get(url);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.html;
  }

  const existing = inFlight.get(url);
  if (existing) return existing;

  const promise = (async () => {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: { "User-Agent": "Carnect-Internal-Offer-Tool/1.0" },
      });
      if (!res.ok) return null;

      const html = await res.text();
      htmlCache.set(url, { html, expiresAt: Date.now() + CACHE_TTL_MS });
      return html;
    } finally {
      inFlight.delete(url);
    }
  })();

  inFlight.set(url, promise);
  return promise;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function digitsOnly(s: string | undefined): number | null {
  if (!s) return null;
  const cleaned = s.replace(/[^\d]/g, "");
  return cleaned ? Number(cleaned) : null;
}

/** carnect.biz's URL path suffix for a listing, matching our internal listing_id 1:1. */
function detailUrl(listingId: string): string {
  return `${BASE_URL}/car/${listingId}`;
}

/** Given a raw search-box value or a catalog href, work out {listingId, source}. */
export function parseListingId(raw: string): { listingId: string; source: Source } {
  const cleaned = raw.replace(/^\/car\//, "").replace(/\?.*$/, "");
  if (cleaned.startsWith("heydealer/")) return { listingId: cleaned, source: "heydealer" };
  if (cleaned.startsWith("supercar/")) return { listingId: cleaned, source: "supercar" };
  return { listingId: cleaned, source: "encar" };
}

function buildCondition(specs: Record<string, string>): VehicleCondition {
  const grade = specs["grade"] ?? specs["condition grade"];
  return {
    grade: grade === "A" || grade === "B" || grade === "C" ? grade : "N/A",
    insurance_record: specs["insurance"] ?? specs["insurance record"] ?? "Not reported by source",
    diagnosis: specs["diagnosis"] ?? "Not reported by source",
    inspection: specs["inspection"] ?? "Not reported by source",
    owner_changes: digitsOnly(specs["owner changes"]) ?? 0,
  };
}

function extractPhotos(html: string): string[] {
  const photos = new Set<string>();

  const apiImgRe = /\/api\/images\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9-]+/g;
  let m: RegExpExecArray | null;
  while ((m = apiImgRe.exec(html))) {
    photos.add(`${BASE_URL}${m[0]}`);
  }

  // Next/Image-proxied external photos (HeyDealer S3, Carnect's own Encar CDN mirror).
  const nextImgRe = /_next\/image\?url=([^&"]+)/g;
  while ((m = nextImgRe.exec(html))) {
    const decoded = decodeURIComponent(m[1]);
    if (decoded.startsWith("http")) photos.add(decoded);
  }

  return [...photos];
}

/**
 * Split a title string on the double-comment marker React/Next.js emits
 * between two adjacent JSX text expressions (`{brand}<!-- --> <!-- -->{model}`).
 * Falls back to treating the whole string as the model with no brand split.
 */
function splitBrandModel(raw: string): { brand: string; model: string } {
  const cleaned = decodeEntities(raw).trim();
  const marker = cleaned.match(/^([\s\S]*?)<!--\s*-->\s*<!--\s*-->([\s\S]*)$/);
  if (marker) {
    return { brand: marker[1].trim(), model: marker[2].trim() };
  }
  return { brand: "", model: cleaned.replace(/<!--.*?-->/g, "").replace(/\s+/g, " ").trim() };
}

function parseListingHtml(html: string, listingId: string, source: Source): Vehicle | null {
  const marqueM = html.match(/car-lux__marque">([^<]+)</);
  const h1M = html.match(/<h1>([\s\S]*?)<\/h1>/);
  if (!h1M) return null; // No recognizable title — don't guess, let the caller fall back.

  let brand: string;
  let model: string;
  if (marqueM) {
    brand = decodeEntities(marqueM[1]).trim();
    model = decodeEntities(h1M[1]).replace(/<!--.*?-->/g, "").trim();
  } else {
    ({ brand, model } = splitBrandModel(h1M[1]));
  }
  const titleEn = [brand, model].filter(Boolean).join(" ").trim();
  if (!titleEn) return null;

  const yearM = html.match(/car-lux__year">(\d{4})</);
  const priceUsdM = html.match(/ta-price__val">\$([\d,]+)</);
  const priceKrwM = html.match(/Source price[^₩]*₩([\d,]+)/);
  if (!priceKrwM) return null; // No price — treat as unparsed, fall back to mock.

  const specs: Record<string, string> = {};
  const specRe = /ta-specs__cell"><span class="ta-specs__k">([^<]+)<\/span><span class="ta-specs__v[^"]*">([^<]+)<\/span>/g;
  let sm: RegExpExecArray | null;
  while ((sm = specRe.exec(html))) {
    specs[sm[1].trim().toLowerCase()] = decodeEntities(sm[2].trim());
  }

  const regDate = specs["reg. date"] ?? specs["reg date"] ?? "";
  const year = yearM ? Number(yearM[1]) : Number(regDate.match(/\d{4}/)?.[0]) || 0;

  return {
    listing_id: listingId,
    source,
    plate: null, // Not present in any public page we've seen — see README §6.
    vin: specs["vin"] ?? null,
    seats: digitsOnly(specs["seats"]),
    url: detailUrl(listingId),
    title_en: titleEn,
    brand,
    model,
    trim: "", // Not separable from `model` without more samples — see README.
    year,
    reg_date: regDate,
    mileage_km: digitsOnly(specs["mileage"]) ?? 0,
    fuel: specs["fuel"] ?? "",
    transmission: specs["transmission"] ?? "",
    engine_cc: digitsOnly(specs["engine"]),
    color: specs["color"] ?? "",
    body: specs["body type"] ?? specs["body"] ?? "",
    price_krw: Number(priceKrwM[1].replace(/,/g, "")),
    photos: extractPhotos(html),
    condition: buildCondition(specs),
    updated_at: new Date().toISOString(),
    data_origin: "live",
  };
}

export async function fetchLiveByListingId(rawListingId: string, source?: string): Promise<Vehicle | null> {
  const { listingId } = parseListingId(rawListingId);
  const html = await fetchHtml(detailUrl(listingId));
  if (!html) return null;
  const resolvedSource = (source as Source) ?? parseListingId(rawListingId).source;
  return parseListingHtml(html, listingId, resolvedSource);
}

interface CatalogCard {
  listingId: string;
  source: Source;
  href: string;
}

function parseCatalogCards(html: string): CatalogCard[] {
  const cards: CatalogCard[] = [];
  const chunks = html.split('<article class="ta-car ');
  for (let i = 1; i < chunks.length; i++) {
    const chunk = chunks[i];
    const hrefM = chunk.match(/href="(\/car\/[^"?]+)/);
    if (!hrefM) continue;
    const { listingId, source } = parseListingId(hrefM[1]);
    cards.push({ listingId, source, href: hrefM[1] });
  }
  return cards;
}

/**
 * Best-effort plate search: scrape carnect.biz's own catalog filter rather
 * than reimplementing it. UNVERIFIED — see the module doc comment. Returns
 * null (triggering the mock fallback in lib/data.ts) on any mismatch.
 */
export async function fetchLiveByPlate(plate: string): Promise<Vehicle | null> {
  const url = `${BASE_URL}/catalog?tab=encar&plate=${encodeURIComponent(plate)}`;
  const html = await fetchHtml(url);
  if (!html) return null;

  const cards = parseCatalogCards(html);
  if (cards.length === 0) return null;

  return fetchLiveByListingId(cards[0].listingId, cards[0].source);
}
