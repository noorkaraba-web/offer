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
- `heydealer` listing pages (`/car/heydealer/{id}`, IDs short mixed-case alphanumeric —
  e.g. `lG22apbQ`, never numeric) — verified against a real listing (2023 Kia Carnival,
  `/car/heydealer/lG22apbQ`). Structurally different from Encar in three ways, all now
  handled: (1) condition data (owner changes, this-car/counterpart accidents, total
  loss, flood damage, theft records, inspection-valid-until date) arrives as plain
  `ta-specs__cell` rows, not embedded JSON — `buildHeydealerCondition` reads it
  straight from the specs map Encar also uses, no RSC-payload parsing needed; (2)
  photos are un-proxied `<img src="https://heydealer-api.s3.amazonaws.com/...">` tags,
  not `/_next/image?url=` like its own catalog thumbnails or `/api/images/`/
  `img.carnect.biz` like the other two sources — `extractPhotos` now matches this
  pattern too (24/24 photos parsed correctly on the sample); (3) no `<!-- --> <!-- -->`
  brand/model marker on the `<h1>` (unlike Encar's), so `brand` comes back empty and
  the full name lands in `model` — cosmetic only, `title_en` is still correct. No
  `application/ld+json` block either (same as supercar).
- **No plate number anywhere** — checked both the visible HTML and the embedded JSON
  (including likely key names: `carNo`, `plateNo`, `licensePlate`, `regNo` — none
  present) on the real Encar page. This confirms the PRD §6 concern directly rather
  than just inferring it.
- Real image hosts: `img.carnect.biz` (Encar), `heydealer-api.s3.amazonaws.com`
  (HeyDealer), `carnect.biz/api/images/...` (Supercar) — all in `next.config.js`.

**Bare listing-ID routing bug, fixed**: a listing ID typed/passed without its source
prefix (e.g. `lG22apbQ` instead of `heydealer/lG22apbQ`) used to default to `encar`
unconditionally, building the wrong URL for any non-Encar source — a real HeyDealer
listing 404ing this way looked exactly like "HeyDealer can't be looked up at all," which
is what surfaced it. `parseListingId` now treats a purely-numeric bare ID as `encar`
(unambiguous — it's the only numeric-ID source) and anything else bare as `heydealer`
(the only other source whose IDs staff would plausibly type unprefixed; a bare supercar
ID is inherently ambiguous with this scheme, but staff only ever encounter supercar IDs
already embedded in a `/car/supercar/...` URL, so this shouldn't come up in practice).

**Best-effort, NOT verified**:
- **Plate lookup** — still unconfirmed. Every detail page I have is a normal listing,
  not a plate-search *result*, so none of them tell me what request the search box
  makes. `fetchLiveByPlate` still guesses `/catalog?tab=encar&plate={value}`; zero
  results falls back to mock. The only way to actually confirm this is capturing the
  real request — open that search box in devtools, search a real plate, copy the
  request URL — I can't get there from a listing page.
- Brand/model splitting: the `<!-- --> <!-- -->` marker trick is confirmed on Encar's
  `<h1>` (`Chevrolet<!-- --> <!-- -->Bolt EUV Premiere`) and catalog cards, but does
  *not* appear on HeyDealer's `<h1>` — so it degrades to "everything in `model`" there,
  by design (see above), not a bug.

`Vehicle.condition` always exists but defaults every field to `"Not reported by
source"` / grade `"N/A"` when absent (supercar only now — Encar and HeyDealer both have
real condition sources), rather than being optional everywhere. Check `data_origin` on
a record (`"live"` vs `"mock"`, also shown as a badge on the vehicle detail page) to
know which you're looking at.

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
chips + a grade/insurance/diagnosis/inspection summary row), and a "Share to
WhatsApp" block (language picker, currency selector, generates two cards). The
original fee-breakdown price builder was later replaced outright by the Deal
Calculator port — see "Deal calculator port" below.

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
point, not professionally reviewed). Panel names and self-diagnosis group/item/status
text are now also translated — see "Condition vocabulary translation dictionary"
below for how that works and what it covers.

**Panel status codes** — updated against a real damaged-car sample (2020 Kia Sportage,
`/car/41636435`, 2 replaced panels): `NORMAL` and **`REPLACEMENT`** are now confirmed.
Note the real code is `REPLACEMENT`, not `REPLACED` as originally guessed — fixed in
`PANEL_STATUS_MAP` (`lib/carnect-source.ts`), with `REPLACED` kept as an alias in case
another endpoint/version uses that form. `WELDED`/`CORROSION` are still unconfirmed —
this sample's damage was replacement-only, no welded or corroded panels to check
against. Any code that doesn't match falls back to showing the raw value rather than a
possibly-wrong translation, so nothing is silently mislabeled.

Also fixed from the same sample: `condition.inspection` ("Inspection report available")
was checked against a too-narrow window around the `insurance` JSON key —
`inspection.master.supplyNo` turned out to sit ~15KB earlier in the page on this
listing (vs. a few hundred bytes on the first sample I had), so the bounded-window
search was missing it. Now checked against the full page.

## Deal calculator — removed

An earlier round of this build ported the standalone Deal Calculator tool into the
vehicle detail page in full (VAT modes, Karaba DC, Internal/Buyer-EN/Buyer-AR preview,
the works). That's gone now, by request — no calculator in this buyer-facing app.
`lib/deal-calculator.ts`, `components/PriceCalculator.tsx`, and
`components/VehiclePricingSection.tsx` were deleted outright. In their place,
`components/VehiclePricing.tsx` is just what it says: one editable "FOB price (KRW)"
field, pre-filled from the listing, with a USD/EUR conversion line underneath. It
feeds both "Add to offer" and the WhatsApp share block's landed-price calculation —
same wiring as before, minus everything the calculator added on top.

## Condition vocabulary translation dictionary

Every real inspection-report sample sent so far showed raw Korean leaking through in
two places the static `lib/i18n/cards.ts` dictionary never covered: structural panel
names (`diagnosis[].name`, e.g. "라디에이터 서포트") and the self-diagnosis checklist
(a `mechanical[]` array on Encar listings I hadn't parsed at all until this round —
group/item/status text like "원동기" / "오일누유" / "양호"). `lib/i18n/condition-terms.ts`
is a new ~35-term dictionary (structural panels, self-diagnosis groups, self-diagnosis
items, and status phrases), each with en/ar/ru/fr/es translations, that both card
routes now run every raw panel/group/item name and status string through via
`translateTerm()` before rendering.

**Verified, not guessed**: every group and item name from the real damaged-car sample
you sent — 8 groups, 27 items, all their Korean status text — translates with zero
misses (checked via the ts-node harness against that file's actual `mechanical[]`
array). The three specific terms you flagged as still leaking Korean in the reference
cards (구동축전지 격리 상태, 고전원전기배선 상태(접속단자, 피복, 보호기구), 라디에이터
서포트(볼트체결부품)) are in the dictionary now.

**What happens on a miss**: `translateTerm()` falls back to the raw (Korean) string —
never a blank or an error — and logs a one-time `console.warn` per distinct missing
term (deduped so one busy listing doesn't spam the log), so any newly-encountered
vocabulary that isn't in the dictionary yet is visible in the server log rather than
silently reaching a buyer. Since the dictionary was built from every term in the
samples provided so far, some Korean status phrasing from listings not yet seen could
still be missing — the logging is the mechanism for catching that as it comes up,
not a claim of 100% coverage across every possible Encar listing.

## Public catalog pages — `/{lang}/catalog/{id}`

The buyer-facing link you actually send people, modelled on the MDM reference page.
Server-rendered, no login, same listing ID across all 5 languages (`en`/`ar`/`ru`/`fr`/`es`)
— the language switcher just swaps the URL segment. Example:
`/ar/catalog/41626278`, `/en/catalog/heydealer/lG22apbQ`.

**Why a second root layout**: WhatsApp/Telegram need real SSR HTML for the preview
card, and Arabic needs genuine `dir="rtl"` on `<html>` for the browser to lay the page
out right-to-left from first paint — not a client-side patch after the fact. A single
shared root layout can't see the `[lang]` segment's value, so the app now has *two*
root layouts, Next.js's own supported pattern for this
([multiple root layouts](https://nextjs.org/docs/app/building-your-application/routing/route-groups#opting-specific-segments-out-of-shared-layouts)):
`app/(staff)/layout.tsx` (the existing internal tool, unchanged, `<html lang="en">`)
and `app/(catalog)/[lang]/layout.tsx` (new, `<html lang={lang} dir={rtl?'rtl':'ltr'}>`).
Every existing staff route (`/`, `/car/...`, `/offer/...`, `/offers`) moved under
`app/(staff)/` to make room — route groups (parens) don't change the URL, so none of
those paths changed. `app/api/**` wasn't touched; API route handlers don't render a
layout.

**Open Graph — the most important part, per your framing**: `generateMetadata` in
`app/(catalog)/[lang]/catalog/[...id]/page.tsx` sets `og:title` (make/model/year),
`og:description` (mileage · fuel · a localized "turnkey price with delivery" line),
and `og:image` at the first listing photo declared as 1280×768, plus the matching
`twitter:card summary_large_image` tags. Listing photos are already absolute
`https://` URLs (img.carnect.biz / heydealer's S3 bucket / carnect.biz's own
`/api/images/`), so the image tag works with zero extra config. Canonical/alternate
URLs need `NEXT_PUBLIC_SITE_URL` set once this is deployed (to build absolute URLs) —
without it they still render as relative, which most platforms resolve fine against
the page origin, but set it in production for the safest OG behaviour.

**Equipment list, grouped by category — a data source worth flagging**: while
building this I found that Encar's and HeyDealer's own listing pages already embed a
complete, *already-translated* equipment/options JSON — `"options":[{"category":...,
"label":{"ko":...,"en":...,"es":...,"ru":...,"ar":...},"items":[{"ko":...,"en":...,
...}]}]` — confirmed against both real samples (Encar: 4 categories / 31 items, all
4 languages present; HeyDealer: 2 categories / 4 items, English-only). I hadn't
parsed this before — it's a separate structure from the condition/diagnosis JSON this
project already reads. `extractEquipment()` in `lib/carnect-source.ts` pulls it out
with a small bracket-depth-aware substring extractor (`extractBalanced`) rather than
`JSON.parse`-ing the whole page, since the equipment array is one value buried in a
much larger non-JSON payload; verified round-trips cleanly on both samples (31/31 and
4/4 items, all fields intact). Neither source gives a French label, so
`lib/i18n/equipment-fr.ts` fills that one gap with a real dictionary (all ~35 items
across both samples, keyed by the source's own English label) — falls back to English
and logs on a miss, same convention as the condition-terms dictionary. Category and
item labels in en/ar/ru/es come straight from the source, untouched.

**Fixing the exact bug you pointed out on MDM's page** (month names and colour
leaking Russian on their Arabic page):
- `lib/i18n/dates.ts` parses `reg_date` (confirmed live format `MM/YYYY`, e.g.
  "Reg. date: 12/2022"; the mock seed predates that and uses `YYYY-MM`, so both are
  handled) and renders a real localized month name — "December 2022" / "ديسمبر 2022" /
  "décembre 2022" / etc. — instead of leaving the month as a raw number or, worse, in
  the wrong language.
- `lib/i18n/colors.ts` translates colour names properly rather than leaving them in
  whatever language the source happened to give. carnect.biz's own spec table already
  gives colour in English ("Color: Silver Gray", confirmed on a real listing), but
  colour names are usually a hue word plus a marketing/proper-noun modifier ("Uyuni
  White", "Abyss Black Pearl") that has no real translation — the fix recognizes and
  translates ~30 common hue words (black/white/silver/gray/navy/pearl/metallic/etc.)
  and leaves anything else (the proper-noun part) as-is, so "Uyuni White" becomes
  "Uyuni أبيض" rather than mistranslated or silently left in English. Logs once if a
  colour string contains *no* recognized hue word at all, so a genuinely new one is
  visible rather than silently passed through unflagged.

**Sections, in the order asked for**: photo gallery + thumbnails, specs grid,
equipment by category, condition & inspection report (grade/diagnosis/inspection
sheet, structural panel damage, the grouped self-diagnosis checklist, the
water/modification/recall/basic-structure flags — all reusing the same
`lib/i18n/cards.ts` and `lib/i18n/condition-terms.ts` dictionaries the PNG cards use,
so the two surfaces never drift apart), insurance history (built from
`condition.accidentCounts` with real translated sentences, not raw English text —
falls back to the free-text `insurance_record` field for older/mock data that
predates structured counts), FOB price (the live listing price in KRW + a USD
conversion via the existing `lib/fx.ts`), and a WhatsApp contact button. Share buttons
(copy link / WhatsApp / Telegram) sit right under the title. Full RTL for Arabic
throughout — every section that has directional layout (icon/label ordering, text
alignment) branches on `dir`, since Tailwind's `rtl:` variant alone doesn't cover JSX
ordering decisions like "which side does the plate badge go on."

**Both sharing paths stay live, as asked**: the PNG vehicle/inspection cards
(`/api/cards/vehicle`, `/api/cards/condition`) are untouched. The staff vehicle detail
page's WhatsApp share block now shows the public catalog link (copy / open, in
whichever language is selected) directly above the existing PNG-card generation UI —
link sharing and image sharing side by side, not a replacement of one by the other.

**Not built**: no static generation / ISR for these pages yet (`generateStaticParams`
is only used for the 5 `[lang]` values, not per-listing — each request fetches live,
same caching as the rest of the app via `lib/carnect-source.ts`'s 6h cache). No
sitemap. No per-listing Telegram-specific `og:image` sizing (Telegram is generally
satisfied by the same Open Graph tags WhatsApp uses).
