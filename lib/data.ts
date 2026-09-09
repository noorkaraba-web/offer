import { Vehicle } from "./types";

/**
 * Mock seed data standing in for the Carnect crawler DB.
 * Resolves §6 Option A for this dataset: `plate` is present on every record,
 * so plate search works end-to-end here. Wiring this to the real crawler
 * output just means confirming `car_no` / 차량번호 is captured on ingest and
 * swapping this module for a real DB query (see README).
 */
export const VEHICLES: Vehicle[] = [
  {
    listing_id: "41436660",
    source: "encar",
    plate: "12가3456",
    vin: "WBA53AK00P7A12345",
    url: "https://carnect.biz/car/41436660",
    title_en: "BMW X5 (G05) xDrive 40i M Sport",
    brand: "BMW",
    model: "X5",
    trim: "xDrive 40i M Sport",
    year: 2024,
    reg_date: "2024-12",
    mileage_km: 7033,
    fuel: "Gasoline",
    transmission: "Automatic",
    engine_cc: 2998,
    color: "Black",
    body: "SUV",
    seats: 5,
    price_krw: 106_400_000,
    photos: [
      "https://picsum.photos/seed/x5-front/1200/800",
      "https://picsum.photos/seed/x5-side/1200/800",
      "https://picsum.photos/seed/x5-interior/1200/800",
      "https://picsum.photos/seed/x5-rear/1200/800",
    ],
    condition: {
      grade: "A",
      insurance_record: "No accident",
      diagnosis: "Passed",
      inspection: "Available",
      owner_changes: 1,
    },
    updated_at: "2026-09-09T10:00:00Z",
  },
  {
    listing_id: "heydealer/Q4rVYVwy",
    source: "heydealer",
    plate: "34나7890",
    vin: "KMHL341BBNA098765",
    url: "https://carnect.biz/car/heydealer/Q4rVYVwy",
    title_en: "Genesis G80 (RG3) 2.5T AWD Premium",
    brand: "Genesis",
    model: "G80",
    trim: "2.5T AWD Premium",
    year: 2023,
    reg_date: "2023-05",
    mileage_km: 21_480,
    fuel: "Gasoline",
    transmission: "Automatic",
    engine_cc: 2497,
    color: "Uyuni White",
    body: "Sedan",
    seats: 5,
    price_krw: 52_800_000,
    photos: [
      "https://picsum.photos/seed/g80-front/1200/800",
      "https://picsum.photos/seed/g80-side/1200/800",
      "https://picsum.photos/seed/g80-interior/1200/800",
    ],
    condition: {
      grade: "A",
      insurance_record: "1 minor repair (front bumper)",
      diagnosis: "Passed",
      inspection: "Available",
      owner_changes: 1,
    },
    updated_at: "2026-09-08T06:30:00Z",
  },
  {
    listing_id: "41298104",
    source: "encar",
    plate: "45다1122",
    vin: "KMHGH41GBLA556677",
    url: "https://carnect.biz/car/41298104",
    title_en: "Hyundai Grandeur (GN7) 3.5 Calligraphy",
    brand: "Hyundai",
    model: "Grandeur",
    trim: "3.5 Calligraphy",
    year: 2023,
    reg_date: "2023-02",
    mileage_km: 34_210,
    fuel: "Gasoline",
    transmission: "Automatic",
    engine_cc: 3470,
    color: "Abyss Black Pearl",
    body: "Sedan",
    seats: 5,
    price_krw: 38_900_000,
    photos: [
      "https://picsum.photos/seed/grandeur-front/1200/800",
      "https://picsum.photos/seed/grandeur-side/1200/800",
    ],
    condition: {
      grade: "B",
      insurance_record: "1 accident, other party at fault",
      diagnosis: "Passed",
      inspection: "Available",
      owner_changes: 2,
    },
    updated_at: "2026-09-07T14:12:00Z",
  },
  {
    listing_id: "heydealer/8mKpLr2Q",
    source: "heydealer",
    plate: "78마4433",
    vin: "KNAPH81EBNS223344",
    url: "https://carnect.biz/car/heydealer/8mKpLr2Q",
    title_en: "Kia Sorento (MQ4) 2.2 Diesel Signature",
    brand: "Kia",
    model: "Sorento",
    trim: "2.2 Diesel Signature",
    year: 2022,
    reg_date: "2022-08",
    mileage_km: 41_900,
    fuel: "Diesel",
    transmission: "Automatic",
    engine_cc: 2151,
    color: "Steel Grey",
    body: "SUV",
    seats: 7,
    price_krw: 33_200_000,
    photos: [
      "https://picsum.photos/seed/sorento-front/1200/800",
      "https://picsum.photos/seed/sorento-side/1200/800",
      "https://picsum.photos/seed/sorento-interior/1200/800",
    ],
    condition: {
      grade: "A",
      insurance_record: "No accident",
      diagnosis: "Passed",
      inspection: "Available",
      owner_changes: 1,
    },
    updated_at: "2026-09-09T03:45:00Z",
  },
  {
    listing_id: "40987321",
    source: "encar",
    plate: "91바5567",
    vin: "WDDGF8AB5FR112233",
    url: "https://carnect.biz/car/40987321",
    title_en: "Mercedes-Benz E-Class (W213) E300 4MATIC AMG Line",
    brand: "Mercedes-Benz",
    model: "E-Class",
    trim: "E300 4MATIC AMG Line",
    year: 2023,
    reg_date: "2023-01",
    mileage_km: 18_760,
    fuel: "Gasoline",
    transmission: "Automatic",
    engine_cc: 1991,
    color: "Selenite Grey",
    body: "Sedan",
    seats: 5,
    price_krw: 61_500_000,
    photos: [
      "https://picsum.photos/seed/eclass-front/1200/800",
      "https://picsum.photos/seed/eclass-side/1200/800",
    ],
    condition: {
      grade: "A",
      insurance_record: "No accident",
      diagnosis: "Passed",
      inspection: "Available",
      owner_changes: 1,
    },
    updated_at: "2026-09-06T09:00:00Z",
  },
  {
    listing_id: "heydealer/nT7wZzX1",
    source: "heydealer",
    plate: "22가9988",
    vin: "5NPE24AF9RH334455",
    url: "https://carnect.biz/car/heydealer/nT7wZzX1",
    title_en: "Hyundai Tucson (NX4) 1.6 Hybrid Inspiration",
    brand: "Hyundai",
    model: "Tucson",
    trim: "1.6 Hybrid Inspiration",
    year: 2024,
    reg_date: "2024-03",
    mileage_km: 9_140,
    fuel: "Hybrid",
    transmission: "Automatic",
    engine_cc: 1598,
    color: "Amazon Gray",
    body: "SUV",
    seats: 5,
    price_krw: 30_100_000,
    photos: [
      "https://picsum.photos/seed/tucson-front/1200/800",
      "https://picsum.photos/seed/tucson-side/1200/800",
    ],
    condition: {
      grade: "A",
      insurance_record: "No accident",
      diagnosis: "Passed",
      inspection: "Available",
      owner_changes: 1,
    },
    updated_at: "2026-09-09T01:20:00Z",
  },
];

export function findByListingId(listingId: string, source?: string): Vehicle | undefined {
  return VEHICLES.find(
    (v) => v.listing_id === listingId && (!source || v.source === source)
  );
}

export function findByPlate(plate: string): Vehicle | undefined {
  const normalized = normalizePlate(plate);
  return VEHICLES.find((v) => v.plate && normalizePlate(v.plate) === normalized);
}

export function normalizePlate(plate: string): string {
  return plate.replace(/\s+/g, "").trim();
}

/** Very rough heuristic: Korean plates contain a Hangul syllable; listing IDs don't. */
export function looksLikePlate(query: string): boolean {
  return /[가-힣]/.test(query);
}
