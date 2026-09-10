"use client";

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { Source } from "./types";

const STORAGE_KEY = "carnect_catalog_export_v1";
const MAX_ITEMS = 20;

export interface CatalogExportItem {
  listing_id: string;
  source: Source;
  title_en: string;
}

interface CatalogExportContextValue {
  items: CatalogExportItem[];
  addItem: (item: CatalogExportItem) => void;
  removeItem: (listingId: string) => void;
  clear: () => void;
  hasItem: (listingId: string) => boolean;
}

const CatalogExportContext = createContext<CatalogExportContextValue | null>(null);

/**
 * Selection for the multi-car catalog export (5-20 cars → one PNG each +
 * a cover image, zipped). Same pattern as OfferDraftProvider — localStorage
 * so the selection survives a page reload, since staff look cars up one at
 * a time (no crawler DB to browse/multi-select from directly).
 */
export function CatalogExportProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CatalogExportItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore corrupt local storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage full / unavailable — selection still works for this tab session
    }
  }, [items, hydrated]);

  const value = useMemo<CatalogExportContextValue>(
    () => ({
      items,
      addItem: (item) =>
        setItems((cur) => {
          if (cur.some((i) => i.listing_id === item.listing_id)) return cur;
          if (cur.length >= MAX_ITEMS) return cur;
          return [...cur, item];
        }),
      removeItem: (listingId) => setItems((cur) => cur.filter((i) => i.listing_id !== listingId)),
      clear: () => setItems([]),
      hasItem: (listingId) => items.some((i) => i.listing_id === listingId),
    }),
    [items]
  );

  return <CatalogExportContext.Provider value={value}>{children}</CatalogExportContext.Provider>;
}

export function useCatalogExport(): CatalogExportContextValue {
  const ctx = useContext(CatalogExportContext);
  if (!ctx) throw new Error("useCatalogExport must be used within CatalogExportProvider");
  return ctx;
}

export const CATALOG_EXPORT_MAX_ITEMS = MAX_ITEMS;
export const CATALOG_EXPORT_MIN_ITEMS = 5;
