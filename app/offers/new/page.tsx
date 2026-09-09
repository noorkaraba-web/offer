"use client";

import { useState } from "react";
import Link from "next/link";
import { useOfferDraft, OFFER_DRAFT_MAX_ITEMS } from "@/lib/offer-draft-context";
import { Currency } from "@/lib/types";

const CURRENCIES: Currency[] = ["USD", "EUR", "AED", "KRW", "JPY", "GBP", "CAD", "AUD"];

interface GenerateResult {
  url: string;
  pdf_url: string;
}

export default function OfferDraftPage() {
  const draft = useOfferDraft();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResult | null>(null);

  async function generate() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyer_name: draft.buyer_name || "Buyer",
          buyer_country: draft.buyer_country || undefined,
          destination_port: draft.destination_port || undefined,
          currency: draft.currency,
          expiry_days: draft.expiry_days,
          items: draft.items,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Could not generate the offer.");
        return;
      }
      setResult({ url: json.url, pdf_url: json.pdf_url });
      draft.clear();
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    const waText = `Here's your Carnect offer: ${result.url}`;
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-gray-900">Offer sent</h1>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Public link</p>
          <a href={result.url} className="break-all text-carnect underline">
            {result.url}
          </a>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(waText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-[#25D366] py-2 text-center text-sm font-semibold text-white"
            >
              Open WhatsApp
            </a>
            <a
              href={result.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-gray-300 py-2 text-center text-sm font-medium"
            >
              Open PDF
            </a>
          </div>
        </div>
        <Link href="/offers" className="text-sm text-carnect underline">
          View offer history →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Build offer</h1>

      {draft.items.length === 0 ? (
        <div className="rounded-xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
          No cars added yet. Look up a car and tap &ldquo;Add to offer&rdquo;.
        </div>
      ) : (
        <ul className="space-y-2">
          {draft.items.map((item) => (
            <li key={item.listing_id} className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.title_en}</p>
                <p className="text-xs text-gray-500">₩{item.price_krw.toLocaleString("en-US")} base</p>
              </div>
              <button
                onClick={() => draft.removeItem(item.listing_id)}
                className="text-xs font-medium text-red-600"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-gray-400">
        {draft.items.length}/{OFFER_DRAFT_MAX_ITEMS} vehicles
      </p>

      <div className="space-y-3 rounded-xl bg-white p-4 shadow-sm">
        <div>
          <label className="text-xs uppercase tracking-wide text-gray-500">Buyer name</label>
          <input
            value={draft.buyer_name}
            onChange={(e) => draft.setField("buyer_name", e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs uppercase tracking-wide text-gray-500">Buyer country</label>
            <input
              value={draft.buyer_country}
              onChange={(e) => draft.setField("buyer_country", e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-gray-500">Destination port</label>
            <input
              value={draft.destination_port}
              onChange={(e) => draft.setField("destination_port", e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs uppercase tracking-wide text-gray-500">Currency</label>
            <select
              value={draft.currency}
              onChange={(e) => draft.setField("currency", e.target.value as Currency)}
              className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-gray-500">Expires in (days)</label>
            <input
              type="number"
              value={draft.expiry_days}
              onChange={(e) => draft.setField("expiry_days", Number(e.target.value) || 7)}
              className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
            />
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        onClick={generate}
        disabled={draft.items.length === 0 || submitting}
        className="w-full rounded-lg bg-carnect py-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        {submitting ? "Generating…" : "Generate offer"}
      </button>
    </div>
  );
}
