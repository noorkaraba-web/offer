import { DiagnosisPanel, PanelStatusCode, Source, Vehicle, VehicleCondition } from "./types";

/**
 * Live fetcher for carnect.biz's own public pages, used in place of a
 * crawler DB per the "no dev, no DB access yet" constraint. Confirmed by
 * hand against real page dumps (see repo history / README) for two listing
 * detail templates and both catalog tabs:
 *
 *  - `supercar` listing pages (Carnect's own curated inventory): brand,
 *    model, year, USD + KRW price, 7 specs, full photo gallery. No
 *    condition/insurance/VIN data — this category apparently doesn't carry
 *    it. No `application/ld+json` Vehicle block either.
 *  - `encar` listing pages: same `ta-specs`/`ta-price` markup as supercar,
 *    PLUS a clean `application/ld+json` Vehicle schema block (used as the
 *    primary source for brand/model/year/fuel/transmission/color/mileage/
 *    engine — more reliable than scraping visible text), PLUS real
 *    accident/insurance/diagnosis data embedded as escaped JSON in the RSC
 *    payload (Encar's own inspection report — accident counts, owner
 *    changes, per-panel diagnosis results). No plate number anywhere, and
 *    no plate-shaped key in that JSON either (checked `carNo`, `plateNo`,
 *    `licensePlate`, `regNo` — none present).
 *  - `heydealer` listing pages: NOT verified — no real sample seen yet.
 *    Reuses the same selectors as encar/supercar (the site's `ta-`/`cd-`
 *    prefixed classes are a shared design system); returns null and falls
 *    back to mock data if a real page doesn't match.
 *  - Catalog pages (`/catalog`, `/catalog?tab=encar`): fully parsed and
 *    verified — used for the plate-search fallback below.
 *  - Plate search: the catalog has a real "License plate" search box, but
 *    it's wired to client JS with no visible endpoint in the static HTML,
 *    and the one detail page confirmed so far has no plate field to
 *    cross-check against. `fetchLiveByPlate` guesses
 *    `?tab=encar&plate=<value>` (matching our own API's `?plate=` naming)
 *    against the catalog page and parses whatever comes back. If that
 *    guess is wrong, zero cards are found and lib/data.ts falls back to
 *    mock data — same safe-degrade behavior. STILL UNCONFIRMED — the real
 *    fix is capturing the actual network request the search box makes.
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

function digitsOnly(s: string | undefined | null): number | null {
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

interface JsonLdVehicle {
  name?: string;
  brand?: { name?: string };
  model?: string;
  vehicleModelDate?: string;
  fuelType?: string;
  vehicleTransmission?: string;
  color?: string;
  mileageFromOdometer?: { value?: number };
  vehicleEngine?: { engineDisplacement?: { value?: number } };
  offers?: { price?: number; priceCurrency?: string };
}

/** schema.org Vehicle markup, present on encar/heydealer's standard detail template. */
function extractJsonLdVehicle(html: string): JsonLdVehicle | null {
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    try {
      const obj = JSON.parse(m[1]);
      if (obj && obj["@type"] === "Vehicle") return obj as JsonLdVehicle;
    } catch {
      // Not valid JSON (or not the block we want) — keep scanning.
    }
  }
  return null;
}

// Encar's panel `name` field is usually an ALL_CAPS_ENUM like
// FRONT_FENDER_LEFT. Mapped to what the reference UI shows; anything not in
// this map falls back to a humanized version of the enum (or the raw value
// verbatim if it isn't enum-shaped at all — e.g. already-Korean text, which
// happens on real listings per a sample screenshot showing an untranslated
// "라디에이터 서포트(볼트체결부위)" panel name).
const PANEL_NAME_MAP: Record<string, string> = {
  FRONT_FENDER_LEFT: "Front fender (L)",
  FRONT_FENDER_RIGHT: "Front fender (R)",
  FRONT_DOOR_LEFT: "Front door (L)",
  FRONT_DOOR_RIGHT: "Front door (R)",
  BACK_DOOR_LEFT: "Rear door (L)",
  BACK_DOOR_RIGHT: "Rear door (R)",
  TRUNK_LID: "Trunk lid",
  HOOD: "Hood",
  ROOF: "Roof",
  QUARTER_PANEL_LEFT: "Quarter panel (L)",
  QUARTER_PANEL_RIGHT: "Quarter panel (R)",
  SIDE_SILL_PANEL_LEFT: "Side sill (L)",
  SIDE_SILL_PANEL_RIGHT: "Side sill (R)",
  PILLAR_PANEL_A_LEFT: "A-pillar (L)",
  PILLAR_PANEL_A_RIGHT: "A-pillar (R)",
  PILLAR_PANEL_B_LEFT: "B-pillar (L)",
  PILLAR_PANEL_B_RIGHT: "B-pillar (R)",
  PILLAR_PANEL_C_LEFT: "C-pillar (L)",
  PILLAR_PANEL_C_RIGHT: "C-pillar (R)",
  RADIATOR_SUPPORT: "Radiator support",
  RAD_SUPPORT: "Radiator support",
};

function humanizePanelName(raw: string): string {
  if (PANEL_NAME_MAP[raw]) return PANEL_NAME_MAP[raw];
  if (!/^[A-Z0-9_]+$/.test(raw)) return raw; // Not enum-shaped (e.g. Korean) — show as-is.
  return raw
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// "NORMAL" and "REPLACEMENT" are confirmed against real samples (a clean
// car and a damaged one — 2 replaced panels: HOOD, FRONT_FENDER_LEFT).
// Note the confirmed code is "REPLACEMENT", not "REPLACED" as originally
// guessed — kept below as an alias in case a different endpoint/version
// uses that form. WELDED/CORROSION remain unconfirmed guesses (this
// sample's damage was replacement-only, no welded or corroded panels to
// check against) — matched to a reference screenshot's displayed
// "WELDED / PANEL BEATEN" label, but the underlying Encar enum value is
// still unverified. Unmapped codes fall back to the raw value rather than
// a wrong translation.
const PANEL_STATUS_MAP: Record<string, PanelStatusCode> = {
  NORMAL: "normal",
  REPLACEMENT: "replaced",
  REPLACED: "replaced",
  EXCHANGE: "replaced",
  EXCHANGED: "replaced",
  WELDED: "welded",
  WELDING: "welded",
  WELD: "welded",
  PANEL_BEATEN: "welded",
  SHEET_METAL: "welded",
  CORROSION: "corrosion",
  RUST: "corrosion",
};

/**
 * Encar's real inspection/insurance data arrives as an escaped JSON blob
 * inside the page's RSC payload (not as plain HTML), e.g.
 * `\"insurance\":{\"myAccidentCnt\":0,\"otherAccidentCnt\":1,...}`. We pull
 * a bounded window around the `diagnosis`/`insurance` keys and regex the
 * fields out rather than fully unescaping and JSON.parse-ing the whole
 * payload, since its exact boundaries aren't reliably knowable.
 */
function extractEncarCondition(html: string): VehicleCondition | null {
  const anchor = html.indexOf('\\"insurance\\":{');
  if (anchor === -1) return null;

  const windowStart = Math.max(0, anchor - 6000);
  const region = html.slice(windowStart, anchor + 2000);

  const myAccidents = digitsOnly(region.match(/\\"myAccidentCnt\\":(\d+)/)?.[1]) ?? 0;
  const otherAccidents = digitsOnly(region.match(/\\"otherAccidentCnt\\":(\d+)/)?.[1]) ?? 0;
  const totalLoss = digitsOnly(region.match(/\\"totalLossCnt\\":(\d+)/)?.[1]) ?? 0;
  const floodLoss = digitsOnly(region.match(/\\"floodTotalLossCnt\\":(\d+)/)?.[1]) ?? 0;
  const ownerChanges = digitsOnly(region.match(/\\"ownerChangeCnt\\":(\d+)/)?.[1]) ?? 0;

  let insurance_record: string;
  if (totalLoss > 0 || floodLoss > 0) {
    insurance_record = `Total/flood loss on record (${totalLoss} total loss, ${floodLoss} flood)`;
  } else if (myAccidents === 0 && otherAccidents === 0) {
    insurance_record = "No accident on insurance record";
  } else {
    const parts: string[] = [];
    if (myAccidents > 0) parts.push(`${myAccidents} accident(s), this owner at fault`);
    if (otherAccidents > 0) parts.push(`${otherAccidents} accident(s), other party at fault`);
    insurance_record = parts.join("; ");
  }

  const panelRe = /\\"name\\":\\"([^"\\]+)\\"[^}]*?\\"resultCode\\":\\"([^"\\]+)\\"/g;
  const panels: DiagnosisPanel[] = [...region.matchAll(panelRe)].map(([, rawName, rawStatus]) => ({
    name: humanizePanelName(rawName),
    statusCode: PANEL_STATUS_MAP[rawStatus] ?? "unknown",
    rawStatus,
  }));

  const diagnosis =
    panels.length === 0
      ? "Not reported by source"
      : `${panels.filter((p) => p.statusCode === "normal").length}/${panels.length} inspected panels normal`;

  // Searched against the full page, not the bounded `region` above: unlike
  // diagnosis/insurance (which sit close together), `inspection.master.supplyNo`
  // can be tens of KB away from the insurance block (confirmed on a real
  // sample), so a bounded window misses it.
  const hasInspectionReport = /\\"supplyNo\\":\\"[^"\\]+\\"/.test(html);

  let grade: VehicleCondition["grade"];
  if (totalLoss > 0 || floodLoss > 0) grade = "C";
  else if (myAccidents > 0 || otherAccidents > 0) grade = "B";
  else grade = "A";

  return {
    grade,
    insurance_record,
    diagnosis,
    inspection: hasInspectionReport ? "Inspection report available" : "Not reported by source",
    owner_changes: ownerChanges,
    panels,
  };
}

function extractPhotos(html: string): string[] {
  const seen = new Set<string>(); // dedupe by path, ignoring crop/query params
  const photos: string[] = [];
  const add = (url: string) => {
    const key = url.split("?")[0];
    if (seen.has(key)) return;
    seen.add(key);
    photos.push(url);
  };

  const apiImgRe = /\/api\/images\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9-]+/g;
  let m: RegExpExecArray | null;
  while ((m = apiImgRe.exec(html))) add(`${BASE_URL}${m[0]}`);

  // Encar/HeyDealer's own CDN, embedded directly as real <img src> tags.
  const directImgRe = /src="(https:\/\/img\.carnect\.biz\/[^"]+)"/g;
  while ((m = directImgRe.exec(html))) add(decodeEntities(m[1]));

  // Next/Image-proxied external photos (HeyDealer S3, catalog thumbnails).
  const nextImgRe = /_next\/image\?url=([^&"]+)/g;
  while ((m = nextImgRe.exec(html))) {
    const decoded = decodeURIComponent(m[1]);
    if (decoded.startsWith("http")) add(decoded);
  }

  return photos;
}

/**
 * Split a title string on the double-comment marker React/Next.js emits
 * between two adjacent JSX text expressions (`{brand}<!-- --> <!-- -->{model}`).
 * Confirmed on both catalog cards and the encar detail page's `<h1>`.
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
  const jsonLd = extractJsonLdVehicle(html);
  const marqueM = html.match(/car-lux__marque">([^<]+)</);
  const h1M = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);

  let brand = "";
  let model = "";
  if (jsonLd?.brand?.name && jsonLd?.model) {
    brand = jsonLd.brand.name.trim();
    model = jsonLd.model.trim();
  } else if (marqueM && h1M) {
    brand = decodeEntities(marqueM[1]).trim();
    model = decodeEntities(h1M[1]).replace(/<!--.*?-->/g, "").trim();
  } else if (h1M) {
    ({ brand, model } = splitBrandModel(h1M[1]));
  } else {
    return null; // No recognizable title anywhere — don't guess, let the caller fall back.
  }

  const titleEn = [brand, model].filter(Boolean).join(" ").trim();
  if (!titleEn) return null;

  const priceKrwM = html.match(/ta-price__sub">[\s\S]*?₩([\d,]+)/);
  if (!priceKrwM) return null; // No price — treat as unparsed, fall back to mock.

  const specs: Record<string, string> = {};
  const specRe = /ta-specs__cell"><span class="ta-specs__k">([^<]+)<\/span><span class="ta-specs__v[^"]*">([^<]+)<\/span>/g;
  let sm: RegExpExecArray | null;
  while ((sm = specRe.exec(html))) {
    specs[sm[1].trim().toLowerCase()] = decodeEntities(sm[2].trim());
  }

  const yearM = html.match(/car-lux__year">(\d{4})</);
  const regDate = specs["reg. date"] ?? specs["reg date"] ?? "";
  const year =
    (yearM ? Number(yearM[1]) : null) ??
    digitsOnly(jsonLd?.vehicleModelDate ?? undefined) ??
    (Number(regDate.match(/\d{4}/)?.[0]) || 0);

  const condition = extractEncarCondition(html) ?? {
    grade: "N/A",
    insurance_record: "Not reported by source",
    diagnosis: "Not reported by source",
    inspection: "Not reported by source",
    owner_changes: 0,
    panels: [],
  };

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
    mileage_km: digitsOnly(specs["mileage"]) ?? jsonLd?.mileageFromOdometer?.value ?? 0,
    fuel: specs["fuel"] ?? jsonLd?.fuelType ?? "",
    transmission: specs["transmission"] ?? jsonLd?.vehicleTransmission ?? "",
    engine_cc: digitsOnly(specs["engine"]) ?? jsonLd?.vehicleEngine?.engineDisplacement?.value ?? null,
    color: specs["color"] ?? jsonLd?.color ?? "",
    body: specs["body type"] ?? specs["body"] ?? "",
    price_krw: Number(priceKrwM[1].replace(/,/g, "")),
    photos: extractPhotos(html),
    condition,
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
