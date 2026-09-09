export type Source = "encar" | "heydealer" | "supercar";

export type ConditionGrade = "A" | "B" | "C" | "N/A";

/** Canonical, language-independent panel status — mapped to display text by lib/i18n/cards.ts. */
export type PanelStatusCode = "normal" | "replaced" | "welded" | "corrosion" | "unknown";

export interface DiagnosisPanel {
  /** English display name, e.g. "Front fender (L)". Falls back to the
   * source's raw (sometimes Korean) label when we don't have a mapping for it. */
  name: string;
  /** The exact source string (ALL_CAPS enum or raw Korean) `name` was derived
   * from — kept so card rendering can re-translate into the buyer's language
   * via lib/i18n/condition-terms.ts instead of always showing English. */
  rawName: string;
  statusCode: PanelStatusCode;
  /** Raw label from the source, kept for statuses we couldn't map (statusCode "unknown"). */
  rawStatus: string;
}

/** One row of Encar's self-diagnosis checklist (engine/transmission/steering/etc). */
export interface SelfDiagnosisItem {
  /** Raw Korean group name, e.g. "원동기" — translate via lib/i18n/condition-terms.ts. */
  group: string;
  /** Raw Korean item name, e.g. "오일 유량". */
  item: string;
  /** Raw Korean status text, e.g. "양호". */
  statusKo: string;
  ok: boolean;
}

export interface AccidentCounts {
  myAccidents: number;
  otherAccidents: number;
  totalLoss: number;
  floodLoss: number;
  ownerChanges: number;
  theft: number;
}

export interface VehicleCondition {
  grade: ConditionGrade;
  insurance_record: string;
  diagnosis: string;
  inspection: string;
  owner_changes: number;
  /** Per-panel diagnosis results, when the source provides them (Encar/HeyDealer structural repairs). */
  panels: DiagnosisPanel[];
  /** Full self-diagnosis checklist (Encar only, confirmed — optional section not every listing has). */
  selfDiagnosis: SelfDiagnosisItem[];
  /** Structured accident/loss counts, when available, so card rendering can
   * build a fully localized sentence instead of using the English one above. */
  accidentCounts: AccidentCounts | null;
  /** ISO-ish "valid until" date string for the inspection sheet, when the source gives one (HeyDealer). */
  inspectionValidUntil: string | null;
  /**
   * Encar's inspection-sheet flags (confirmed keys: waterlog, recall).
   * `modification` maps to Encar's `simpleRepair` flag as a best-effort
   * stand-in — no "modification/개조" key was found in either real sample,
   * so this is inferred, not confirmed. `basicStructureDamage` is derived
   * from `panels` (true if any panel is non-normal), not a separate source
   * field. Encar only.
   */
  flags: { waterDamage: boolean; modification: boolean; recall: boolean; basicStructureDamage: boolean } | null;
}

export interface Vehicle {
  listing_id: string;
  source: Source;
  plate: string | null;
  vin: string | null;
  seats: number | null;
  url: string;
  title_en: string;
  brand: string;
  model: string;
  trim: string;
  year: number;
  reg_date: string;
  mileage_km: number;
  fuel: string;
  transmission: string;
  engine_cc: number | null;
  color: string;
  body: string;
  price_krw: number;
  photos: string[];
  condition: VehicleCondition;
  updated_at: string;
  /** Where this record actually came from — surfaced in the UI so staff can tell live data from the mock fallback. */
  data_origin: "live" | "mock";
}

export type Currency = "USD" | "EUR" | "AED" | "KRW" | "JPY" | "GBP" | "CAD" | "AUD";

export interface OfferItem {
  listing_id: string;
  source: Source;
  title_en: string;
  price_krw: number;
  auction_fee_krw: number;
  carnect_fee_krw: number;
  inland_krw: number;
  freight_usd: number;
  show_breakdown: boolean;
  note?: string;
}

export interface Offer {
  offer_id: string;
  slug: string;
  buyer_name: string;
  buyer_country?: string;
  destination_port?: string;
  currency: Currency;
  created_at: string;
  expires_at: string;
  view_count: number;
  items: OfferItem[];
}

export interface FxRates {
  base: "KRW";
  rates: Record<Currency, number>;
  updated_at: string;
  source: "live" | "static-fallback";
}
