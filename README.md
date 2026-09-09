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

> **This app was written but never run as a Next.js dev server in the sandbox that
> produced it** — outbound access to the npm registry is blocked there, so `npm
> install` can't complete. I did statically parse every `.ts`/`.tsx` file with the
> TypeScript compiler to catch syntax errors (none found), and separately
> unit-tested `lib/carnect-source.ts` — the live carnect.biz fetcher — by transpiling
> it and feeding it real page HTML you provided (with `fetch` mocked), which confirmed
> it correctly parses the real supercar listing end-to-end and degrades safely (returns
> `null` → mock fallback) when the HTML doesn't match what it expects. What's *not*
> verified is the full Next.js app actually running — routing, rendering, the browser
> flows. Please run `npm install && npm run dev` and click through: search → vehicle
> detail → price builder → add to offer → generate offer → open the public offer link.

## Data source: live from carnect.biz, mock as fallback

There's no crawler DB or dev access yet, and carnect.biz's public pages don't expose a
JSON API — so `lib/carnect-source.ts` fetches and parses the live HTML pages directly,
the same way a browser would render them, and `lib/data.ts` falls back to the mock seed
in `VEHICLES` whenever that fails (network error, page structure doesn't match, listing
genuinely doesn't exist). `findByListingId`/`findByPlate` are async now for this reason
— every call site already awaits them.

**Confirmed working**, verified against real page dumps (not guessed):
- `supercar` listing pages (`/car/supercar/{id}`) — brand, model, year, USD + KRW
  price, 7 specs, full photo gallery. No condition/VIN data on this template at all
  (Carnect's own curated inventory, not Encar-sourced — plausibly why).
- `encar` listing pages (`/car/{numericId}`) — same specs as supercar, **plus**: a
  clean `application/ld+json` Vehicle schema block (used as the primary source for
  brand/model/year/fuel/transmission/color/mileage/engine — more reliable than the
  visible-text scrape, which is used as a fallback/supplement), VIN, seats, and **real**
  condition data. Encar's inspection report — accident counts (this owner vs. other
  party at fault), owner changes, total/flood loss flags, and a per-panel diagnosis
  array — arrives as escaped JSON inside the page's RSC payload, not as plain HTML;
  `extractEncarCondition` regexes the relevant fields out of a bounded window around
  it. One caveat: **Encar doesn't hand us a letter grade** — `condition.grade` is a
  *derived* heuristic (A = no accidents, B = accident(s) but no total loss, C = total
  or flood loss on record), not something Encar itself reports. 12 full-size photos
  parsed correctly (real `<img src="https://img.carnect.biz/...">` tags, deduped by
  path so the same photo at a different crop isn't listed twice).
- Catalog pages (`/catalog`, `/catalog?tab=encar`) — card-level brand/model, year,
  mileage, fuel, reg. date, price (Encar shows USD + KRW; HeyDealer often shows "Price
  on request" instead). Used internally for the plate-search fallback below.
- **No plate number anywhere** — checked both the visible HTML and the embedded JSON
  (including likely key names: `carNo`, `plateNo`, `licensePlate`, `regNo` — none
  present) on the real Encar page. This confirms the PRD §6 concern directly rather
  than just inferring it.
- Real image hosts: `img.carnect.biz` (Encar), `heydealer-api.s3.amazonaws.com`
  (HeyDealer), `carnect.biz/api/images/...` (Supercar) — all in `next.config.js`.

**Best-effort, NOT verified**:
- **HeyDealer listing detail pages** — still no real sample. `parseListingHtml` falls
  back to the same selectors confirmed on encar/supercar (shared `ta-`/`cd-`-prefixed
  design system), and returns `null` → mock fallback if a real page doesn't match, same
  safe-degrade as before. Send me one (`curl https://carnect.biz/car/heydealer/{id}`)
  and I'll verify it the same way.
- **Plate lookup** — still unconfirmed. The Encar detail page I now have is a normal
  listing, not a plate-search *result*, so it doesn't tell me what request the search
  box makes. `fetchLiveByPlate` still guesses `/catalog?tab=encar&plate={value}`; zero
  results falls back to mock. The only way to actually confirm this is capturing the
  real request — open that search box in devtools, search a real plate, copy the
  request URL — I can't get there from a listing page.
- Brand/model splitting: the `<!-- --> <!-- -->` marker trick is now confirmed on a
  real encar `<h1>` too (`Chevrolet<!-- --> <!-- -->Bolt EUV Premiere`), not just
  catalog cards — so this is more solid than before, just still worth flagging since
  HeyDealer's template is unconfirmed.

`Vehicle.condition` always exists but defaults every field to `"Not reported by
source"` / grade `"N/A"` when absent (supercar, or HeyDealer until verified), rather
than being optional everywhere. Check `data_origin` on a record (`"live"` vs `"mock"`,
also shown as a badge on the vehicle detail page) to know which you're looking at.

Caching: successful live fetches (listing pages and catalog pages alike) are cached
in-process for 6h per PRD §8, with concurrent identical requests deduped to a single
in-flight fetch — so a burst of clicks doesn't fan out into a burst of hits on
carnect.biz. Like the offer store, this cache is a plain in-memory `Map`, fine for a
single running process/dev server but not guaranteed to survive Vercel's serverless
cold starts.

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

1. Plate field in crawler data — not directly answerable (no crawler DB access), but
   carnect.biz's own catalog page has a working plate-search box, so the backend
   clearly resolves plates → Encar listings already. See "Data source" above for what's
   wired vs. still a guess.
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
(vehicle detail's share block is WhatsApp-only now — see below), saved fee presets per
destination country, and offer view notifications.

## Vehicle detail redesign, share cards, and the two bugs you hit

Reworked to match the reference screenshots: dark navy theme, yellow plate badge,
KRW-primary price with USD/EUR underneath, a full photo grid (not a scroll strip), a
"Condition & accident history" block (structural-damage warning + per-panel status
chips + a grade/insurance/diagnosis/inspection summary row), and a new "Share to
WhatsApp" block (language picker, currency + landed-price input, generates two cards).
The old fee-breakdown price builder (for the multi-car Offer Builder — a different
PRD flow) is still there, just restyled and moved below the new share block.

**The font bug, fixed first as asked:** "Failed to load dynamic font" happens because
`next/og`'s `ImageResponse`, given no explicit `fonts`, tries to resolve non-Latin
glyphs (Korean plate characters, at minimum) from a remote font-resolution service at
render time — which 400s if that service is unreachable. I couldn't reproduce your
exact 500 on `/api/cards/condition` without a running server, but it's the same
mechanism, and every card route now supplies local fonts explicitly
(`lib/og-fonts.ts`), eliminating any runtime font network call — this should fix both.
Fonts are Google's Noto Sans / Noto Sans Arabic / Noto Sans KR, pulled via a shallow
sparse clone of `google/fonts` (the sandbox that built this couldn't reach
`fonts.gstatic.com` directly, but could reach GitHub) and committed under
`assets/fonts/`. **`NotoSansKR.ttf` is the full unsubset variable font (~10MB)** —
there's no `fonttools`/`pyftsubset` available in that sandbox to cut it down to just
the ~50 Hangul syllables Korean plates use. Works correctly as-is; subsetting it is a
worthwhile follow-up with real dev tooling (smaller edge function, faster cold start).

**The `/api/lookup?id=42147167` 404**: I couldn't fetch that page to check, so I can't
tell you definitively whether it's delisted/a typo, or a real listing whose price the
parser couldn't find (it deliberately returns nothing rather than show a car with no
price — see `parseListingHtml`'s `if (!priceKrwM) return null`). If it's a real active
listing, send me `curl https://carnect.biz/car/42147167` and I'll check.

**Logo**: cards reference `{origin}/logo-white.png` at render time (`tryLoadLogo` in
`lib/og-card-shared.tsx`) and fall back to a plain "CARNECT" text wordmark if that
404s — so nothing breaks before you commit it. **You'll need to add
`public/logo-white.png` to the repo** (create the `public/` folder if it isn't there)
for the real logo to show up on generated cards.

**Translations**: `lib/i18n/cards.ts` covers English, Arabic (RTL), Russian, French,
and Spanish for the cards' static labels (I wrote these myself — a solid starting
point, not professionally reviewed). What's **not** translated: the dynamic
condition/diagnosis sentences generated from Encar's raw data (e.g. "1 accident(s),
other party at fault") and panel names (e.g. "Front fender (L)") — those are
English-generated strings, and translating arbitrary generated text into 4 more
languages isn't something a static key/value dictionary can do. They render in English
regardless of card language; only the surrounding labels and panel *status* words
(Normal/Replaced/Welded/Corrosion — a small fixed vocabulary) are translated.

**Panel status codes**: `NORMAL` is confirmed against a real (undamaged) car. The
`REPLACED` / `WELDED` (→ "Welded / panel beaten") / `CORROSION` mappings in
`PANEL_STATUS_MAP` (`lib/carnect-source.ts`) are informed guesses matched against your
reference screenshot's displayed labels for a *different*, damaged car — I don't have
a raw HTML sample with actual damage to confirm the underlying Encar codes against.
Any code that doesn't match falls back to showing the raw value rather than a
possibly-wrong translation, so nothing is silently mislabeled — but if you can send me
one damaged-car listing's HTML, I can verify/correct these precisely.
