# PRD — Carnect Lookup & Offer Builder

**Owner:** Noor Karaba
**Product:** Internal + dealer-facing tool at `carnect.biz`
**Version:** 0.1 — draft for build
**Reference:** `hhaa-gules.vercel.app` (Encar-sourced plate lookup) — same UX, Carnect as the data source

---

## 1. Problem

Today, answering a buyer who says *"send me an offer"* means: open the listing, screenshot photos, retype specs into English, calculate the landed price by hand, and paste it all into WhatsApp. It takes 10–20 minutes per car and the output looks inconsistent.

## 2. Goal

One input (plate number or listing ID) → a complete English vehicle record with photos, condition history, and a price the buyer can act on → a shareable image card sent to WhatsApp/Telegram in under 60 seconds.

Second goal: bundle 2–10 of those cars into a single **Offer** with one link the buyer can open.

## 3. Non-goals (v1)

- No buyer self-service search (buyers receive links, they don't search)
- No payments, invoicing, or shipping documents
- No bidding or auction placement
- No multi-user roles beyond "Carnect staff"

---

## 4. Users

| User | Need |
|---|---|
| Carnect sales staff (primary) | Look up a car fast, price it, send it |
| Overseas buyer (secondary) | Receive a clean card / offer link, no login |

---

## 5. Core flows

### 5.1 Lookup

1. Staff enters **Korean plate** (e.g. `12가3456`) or **listing ID** (`41436660`, or `heydealer/Q4rVYVwy`)
2. System resolves to a Carnect listing
3. Full record renders in English

**States:** loading → found → not found (with "try listing ID instead" fallback)

### 5.2 Price builder

Staff enters or accepts:
- Vehicle price (KRW, auto-filled from listing)
- Auction / purchase fee
- Carnect fee
- Inland transport in Korea
- → **FOB total**
- Optional: destination port → freight → **CFR total**
- Currency toggle: USD / EUR / AED / KRW / JPY / GBP / CAD / AUD (live FX, KRW is the base)

Output: one headline number the buyer sees, with the breakdown shown or hidden per a toggle.

### 5.3 Share card

Generates two PNG images:
- **Vehicle card** — hero photo, make/model/year, mileage, fuel, transmission, price, Carnect logo, contact
- **Condition card** — accident/insurance record, diagnosis, inspection grade

Actions: Save both · Copy text summary · Open WhatsApp · Open Telegram

### 5.4 Offer builder (the differentiator)

1. From any lookup result: **Add to offer**
2. Offer sidebar collects vehicles; each keeps its own price
3. **Generate offer** → produces:
   - A public link `carnect.biz/offer/{slug}` — buyer-facing page, mobile-first, photo galleries, prices, WhatsApp button per car
   - A PDF version for buyers who prefer attachments
   - A WhatsApp-ready text block with the link
4. Offer has an expiry date (default 7 days) and a view counter

---

## 6. The plate-lookup dependency ⚠️

**This is the one thing that decides the build.** The reference site works because Encar exposes plate numbers. Carnect's public pages expose listing IDs (`/car/41436660`, `/car/heydealer/Q4rVYVwy`) — not plates.

Three options, in order of preference:

| Option | What it needs | Verdict |
|---|---|---|
| **A. Plate is already in the crawled data** | Confirm the Encar/HeyDealer crawler stores `car_no` / 차량번호 in the DB, then index it | Best — ship in days |
| **B. Backfill plates** | Re-crawl detail pages to capture plate, build a `plate → listing_id` index table | Fallback — 1–2 weeks |
| **C. Listing-ID-only v1** | Ship without plate search, add it later | Acceptable to launch |

**Action before dev starts:** check the crawler's raw payload for the plate field. If it exists, v1 ships with plate search.

---

## 7. Data model

```json
{
  "listing_id": "41436660",
  "source": "encar",
  "plate": "12가3456",
  "vin": "WBA...",
  "url": "https://carnect.biz/car/41436660",
  "title_en": "BMW X5 (G05) xDrive 40i M Sport",
  "brand": "BMW",
  "model": "X5",
  "trim": "xDrive 40i M Sport",
  "year": 2024,
  "reg_date": "2024-12",
  "mileage_km": 7033,
  "fuel": "Gasoline",
  "transmission": "Automatic",
  "engine_cc": 2998,
  "color": "Black",
  "body": "SUV",
  "seats": 5,
  "price_krw": 106400000,
  "photos": ["https://img.carnect.biz/..."],
  "condition": {
    "grade": "A",
    "insurance_record": "No accident",
    "diagnosis": "Passed",
    "inspection": "Available",
    "owner_changes": 1
  },
  "updated_at": "2026-09-09T10:00:00Z"
}
```

```json
{
  "offer_id": "of_9k2m",
  "buyer_name": "Ahmed",
  "buyer_country": "DZ",
  "destination_port": "Algiers",
  "currency": "USD",
  "expires_at": "2026-09-16",
  "items": [
    {
      "listing_id": "41436660",
      "price_krw": 106400000,
      "auction_fee_krw": 400000,
      "carnect_fee_krw": 1000000,
      "inland_krw": 300000,
      "freight_usd": 1200,
      "total_display": 81100,
      "note": "Ready for loading week 38"
    }
  ]
}
```

---

## 8. API contract

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/lookup?plate={plate}` | Resolve plate → vehicle object |
| `GET` | `/api/lookup?id={listing_id}&source={encar\|heydealer}` | Resolve listing ID → vehicle object |
| `GET` | `/api/fx?base=KRW` | Cached FX rates, refresh hourly |
| `POST` | `/api/offers` | Create offer, returns `{ offer_id, url, pdf_url }` |
| `GET` | `/api/offers/{id}` | Buyer-facing offer payload |
| `POST` | `/api/cards/render` | Returns PNG URLs for vehicle + condition cards |

All lookups cached 6 hours. Photos proxied and cached on Carnect's CDN so cards render even if the source delists the car.

---

## 9. Screens

1. **Search** — single input, plate/ID auto-detect, recent lookups, index counters
2. **Vehicle detail** — photo gallery (swipeable), spec grid, condition block, price builder, share block, "Add to offer"
3. **Offer draft** — list of added cars, per-car price edit, buyer name + port, generate
4. **Offer public page** — no login, mobile-first, one WhatsApp button per car and one for the whole offer
5. **Offer history** — sent offers, view counts, expiry status

---

## 10. Requirements

**Must have (v1)**
- Listing ID lookup, English output, full photo set
- Price builder with fee breakdown + multi-currency
- Two-image share card + WhatsApp deep link
- Offer builder with public link and PDF
- Mobile-first (staff will use this on a phone at the auction lot)

**Should have (v1.1)**
- Plate lookup (pending §6)
- Telegram + KakaoTalk deep links
- Saved fee presets per destination country
- Offer view notifications

**Later**
- Buyer replies inline on the offer page
- Auto-translate notes into buyer's language (RU / AR / ES / EN)
- Carnect AI assistant answering questions on the offer page

---

## 11. Success metrics

| Metric | Target |
|---|---|
| Time from lookup to sent offer | < 60 s for 1 car, < 5 min for 5 cars |
| Offers sent / week | 30+ within one month of launch |
| Offer link open rate | > 70% |
| Lookup failure rate | < 5% |

---

## 12. Build plan

| Phase | Scope | Est. |
|---|---|---|
| 0 | Confirm plate field in crawler data (§6) | 1 day |
| 1 | Lookup API + vehicle detail page | 1 week |
| 2 | Price builder + FX + share cards | 1 week |
| 3 | Offer builder + public page + PDF | 1.5 weeks |
| 4 | Offer history, presets, polish | 1 week |

Stack: reuse the existing Next.js app on Vercel, same DB as the Carnect crawler. Cards rendered server-side with `@vercel/og` or Satori.

---

## 13. Open questions

1. Does the crawler already capture the plate number? *(blocks §6)*
2. Should the offer page show the Carnect FOB breakdown, or only the final number?
3. Do buyers get one offer link per buyer, or one per inquiry?
4. Should offers auto-expire and hide prices after expiry, or stay visible?
