export type Source = "encar" | "heydealer" | "supercar";

export type ConditionGrade = "A" | "B" | "C" | "N/A";

export interface VehicleCondition {
  grade: ConditionGrade;
  insurance_record: string;
  diagnosis: string;
  inspection: string;
  owner_changes: number;
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
