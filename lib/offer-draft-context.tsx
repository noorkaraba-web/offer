"use client";

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { Currency, OfferItem, Source } from "./types";

const STORAGE_KEY = "carnect_offer_draft_v1";
const MAX_ITEMS = 10;

interface DraftState {
  buyer_name: string;
  buyer_country: string;
  destination_port: string;
  currency: Currency;
  expiry_days: number;
  items: OfferItem[];
}

const EMPTY_DRAFT: DraftState = {
  buyer_name: "",
  buyer_country: "",
  destination_port: "",
  currency: "USD",
  expiry_days: 7,
  items: [],
};

interface OfferDraftContextValue extends DraftState {
  addItem: (item: OfferItem) => void;
  removeItem: (listingId: string) => void;
  updateItem: (listingId: string, patch: Partial<OfferItem>) => void;
  setField: <K extends keyof Omit<DraftState, "items">>(key: K, value: DraftState[K]) => void;
  clear: () => void;
  hasItem: (listingId: string) => boolean;
}

const OfferDraftContext = createContext<OfferDraftContextValue | null>(null);

export function OfferDraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<DraftState>(EMPTY_DRAFT);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setDraft({ ...EMPTY_DRAFT, ...JSON.parse(raw) });
    } catch {
      // ignore corrupt local storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // storage full / unavailable — draft still works for this tab session
    }
  }, [draft, hydrated]);

  const value = useMemo<OfferDraftContextValue>(
    () => ({
      ...draft,
      addItem: (item) =>
        setDraft((d) => {
          if (d.items.some((i) => i.listing_id === item.listing_id)) return d;
          if (d.items.length >= MAX_ITEMS) return d;
          return { ...d, items: [...d.items, item] };
        }),
      removeItem: (listingId) =>
        setDraft((d) => ({ ...d, items: d.items.filter((i) => i.listing_id !== listingId) })),
      updateItem: (listingId, patch) =>
        setDraft((d) => ({
          ...d,
          items: d.items.map((i) => (i.listing_id === listingId ? { ...i, ...patch } : i)),
        })),
      setField: (key, val) => setDraft((d) => ({ ...d, [key]: val })),
      clear: () => setDraft(EMPTY_DRAFT),
      hasItem: (listingId) => draft.items.some((i) => i.listing_id === listingId),
    }),
    [draft]
  );

  return <OfferDraftContext.Provider value={value}>{children}</OfferDraftContext.Provider>;
}

export function useOfferDraft(): OfferDraftContextValue {
  const ctx = useContext(OfferDraftContext);
  if (!ctx) throw new Error("useOfferDraft must be used within OfferDraftProvider");
  return ctx;
}

export const OFFER_DRAFT_MAX_ITEMS = MAX_ITEMS;
export type { Source };
