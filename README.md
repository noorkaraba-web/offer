# Carnect Lookup & Offer Builder

Implementation of the [Carnect Lookup & Offer Builder PRD](./docs/PRD.md) v1 "must have" scope:
plate/listing-ID lookup, price builder with multi-currency FOB/CFR, two-image share
cards, and the offer builder (public link + PDF), mobile-first.

## Stack

Next.js 14 (App Router) + TypeScript + Tailwind, matching PRD §12. Share cards are
rendered server-side with `next/og` (the built-in `ImageResponse`, no separate
`@vercel/og` dependency needed). The offer PDF is assembled with `pdf-lib`, embedding
the same rendered card images.

## Running it

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

> **This code was written but not run or type-checked in the sandbox that produced
> it** — outbound access to the npm registry was blocked there (`403` from
> `registry.npmjs.org` on every request), so `npm install` could not complete and no
> dev server could be started. I did statically parse every `.ts`/`.tsx` file with the
> TypeScript compiler to catch syntax errors (none found; the only diagnostics were
> "missing type package" noise from the absent `node_modules`), and I reviewed the app
> end-to-end by hand, but I have not seen it render in a browser. Please run `npm
> install && npm run dev` and click through the flows before treating this as
> shippable — start with: search → vehicle detail → price builder → add to offer →
> generate offer → open the public offer link.

## What's mocked vs. real

There is no existing Carnect app or crawler DB in this repository (it was empty), so:

- **`lib/data.ts`** is a 6-car seed dataset shaped exactly like PRD §7's JSON schema,
  standing in for the crawler DB. Photos are placeholder images (`picsum.photos`) since
  there's no real Carnect CDN to proxy.
- **§6 (the plate-lookup dependency):** every seed record carries a `plate` field, so
  plate search works end-to-end against this dataset — that's Option A from the PRD,
  demonstrated on mock data. Wiring it to production data means: confirm the crawler's
  raw payload actually captures `car_no` / 차량번호 (§6's "action before dev starts"),
  then point `findByPlate`/`findByListingId` in `lib/data.ts` at a real query against
  that DB instead of the in-memory array. Nothing else in the app needs to change —
  `/api/lookup` and every screen just call those two functions.
- **`lib/store.ts`** (offers) is an in-memory `Map`, enough for local dev and a single
  running process, but it will not survive across serverless cold starts on Vercel.
  Production needs offers backed by "the same DB as the Carnect crawler" (PRD §12) —
  swap the four functions in that file for real DB calls; the API routes and pages
  don't know or care how it's implemented.
- **FX rates** (`lib/fx.ts`) try a live fetch (`open.er-api.com`, KRW base) with a
  1-hour in-memory cache, falling back to a static table if the fetch fails — so the
  app still works if that endpoint is unreachable or rate-limited (labelled
  `source: "static-fallback"` in the `/api/fx` response either way).
- **PDF generation** produces a real PDF (cover page + one page per car with the
  rendered vehicle card and pricing), not just a print stylesheet.

## Screens (PRD §9)

| Screen | Route |
|---|---|
| Search | `/` |
| Vehicle detail | `/car/[listingId]` (e.g. `/car/41436660`, `/car/heydealer/Q4rVYVwy`) |
| Offer draft | `/offers/new` |
| Offer public page | `/offer/[slug]` |
| Offer history | `/offers` |

The offer draft is kept client-side (React context + `localStorage`) until "Generate
offer" is pressed, per the sidebar-style flow in PRD §5.4.

## API (PRD §8)

All implemented as documented: `GET /api/lookup`, `GET /api/fx`, `POST /api/offers`,
`GET /api/offers/{id}`, `POST /api/cards/render` (returns the PNG URLs; the PNGs
themselves are served by `GET /api/cards/vehicle` and `GET /api/cards/condition`), plus
`GET /api/offers/{id}/pdf` for the PDF attachment mentioned in §5.4.

## Open questions from PRD §13 — defaults taken for v1

1. Plate field in crawler data — not answerable from this repo; §6 above covers what
   changes once it's confirmed.
2. Offer page shows the FOB/CFR breakdown by default, with a per-car toggle
   (`show_breakdown` on each offer item, set from the price builder) — easy to flip the
   default once there's a real answer.
3. One offer link per generated offer (i.e., effectively per inquiry) — the "Generate
   offer" flow makes a new link every time, nothing keys it to a buyer identity.
4. Offers stay visible after expiry, with an "expired" banner rather than hiding
   prices — chosen so a late-arriving buyer never hits a dead link. Trivial to change to
   hide-on-expiry in `app/offer/[slug]/page.tsx` if that's not the right call.

## Not built (out of v1 "must have" scope, per PRD §10)

Plate lookup is actually in, ahead of its "should have" listing, since it's free on
mock data (see §6 above). Still open, matching "should have (v1.1)":
Telegram/KakaoTalk sharing on the offer public page and offer-draft confirmation
(vehicle detail already has both WhatsApp and Telegram, via `ShareBlock`), saved fee
presets per destination country, and offer view notifications.
