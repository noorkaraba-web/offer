import { Offer } from "./types";

/**
 * In-memory offer store, scoped to the running Node process.
 *
 * This is enough for local dev and for demoing the full flow, but a
 * serverless deployment (Vercel) does not guarantee this module stays warm
 * between requests. Production needs this backed by "the same DB as the
 * Carnect crawler" per PRD §12 — swap the four functions below for real
 * queries against that DB and nothing else in the app needs to change.
 */
const offers = new Map<string, Offer>();

function randomId(prefix: string, length = 6): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${prefix}_${out}`;
}

export function createOffer(data: Omit<Offer, "offer_id" | "slug" | "created_at" | "view_count">): Offer {
  const offer_id = randomId("of");
  const slug = randomId("", 8);
  const offer: Offer = {
    ...data,
    offer_id,
    slug,
    created_at: new Date().toISOString(),
    view_count: 0,
  };
  offers.set(slug, offer);
  return offer;
}

export function getOfferBySlug(slug: string): Offer | undefined {
  return offers.get(slug);
}

export function recordView(slug: string): Offer | undefined {
  const offer = offers.get(slug);
  if (!offer) return undefined;
  offer.view_count += 1;
  return offer;
}

export function listOffers(): Offer[] {
  return Array.from(offers.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function isExpired(offer: Offer): boolean {
  return new Date(offer.expires_at).getTime() < Date.now();
}
