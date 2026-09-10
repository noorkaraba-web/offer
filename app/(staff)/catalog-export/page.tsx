"use client";

import { useState } from "react";
import Link from "next/link";
import { useCatalogExport, CATALOG_EXPORT_MIN_ITEMS, CATALOG_EXPORT_MAX_ITEMS } from "@/lib/catalog-export-context";
import { CARD_LANGUAGES, CardLang } from "@/lib/i18n/cards";
import { Currency } from "@/lib/types";

const CURRENCIES: Currency[] = ["USD", "EUR", "AED", "KRW", "JPY", "GBP", "CAD", "AUD"];

export default function CatalogExportPage() {
  const { items, removeItem, clear } = useCatalogExport();
  const [lang, setLang] = useState<CardLang>("en");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [shipping, setShipping] = useState<number | "">("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  async function generateZip() {
    setBusy(true);
    setError("");
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const shippingValue = shipping === "" ? 0 : shipping;

      setProgress("Generating cover…");
      const coverRes = await fetch(`/api/cards/cover?count=${items.length}&lang=${lang}`);
      if (!coverRes.ok) throw new Error("Cover image failed to generate");
      zip.file("00-cover.png", await coverRes.blob());

      let done = 0;
      await Promise.all(
        items.map(async (item) => {
          const qs = new URLSearchParams({
            id: item.listing_id,
            source: item.source,
            lang,
            currency,
            shipping: String(shippingValue),
          }).toString();
          const res = await fetch(`/api/cards/vehicle?${qs}`);
          if (!res.ok) throw new Error(`Card failed for ${item.title_en}`);
          const blob = await res.blob();
          const safeId = item.listing_id.replace(/\//g, "-");
          zip.file(`${String(done + 1).padStart(2, "0")}-${safeId}.png`, blob);
          done += 1;
          setProgress(`Generated ${done}/${items.length} cards…`);
        })
      );

      setProgress("Zipping…");
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `karaba-catalog-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setProgress("Done!");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong generating the zip.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-navy-text">Catalog export</h1>
        <p className="mt-1 text-sm text-navy-muted">
          Select {CATALOG_EXPORT_MIN_ITEMS}–{CATALOG_EXPORT_MAX_ITEMS} cars from their detail pages
          (&ldquo;+ Add to batch&rdquo;), then generate one card per car plus a cover image, all zipped
          together — drop the whole set into a WhatsApp chat in one go.
        </p>
      </div>

      <div className="rounded-xl border border-navy-border bg-navy-surface p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-navy-text">Selected cars ({items.length})</h2>
          {items.length > 0 && (
            <button onClick={clear} className="text-xs text-navy-muted underline">
              Clear all
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <p className="mt-3 text-sm text-navy-muted">
            No cars selected yet. <Link href="/" className="text-carnect-accent underline">Look one up</Link> and add
            it to the batch.
          </p>
        ) : (
          <ul className="mt-3 space-y-1.5">
            {items.map((item) => (
              <li
                key={item.listing_id}
                className="flex items-center justify-between rounded-lg bg-navy-surface2 px-3 py-2 text-sm"
              >
                <Link href={`/car/${item.listing_id}`} className="truncate text-navy-text hover:underline">
                  {item.title_en || item.listing_id}
                </Link>
                <button onClick={() => removeItem(item.listing_id)} className="ml-2 text-navy-muted hover:text-red-400">
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-navy-border bg-navy-surface p-4">
        <h2 className="text-sm font-semibold text-navy-text">Language &amp; shipping</h2>
        <p className="mt-1 text-xs text-navy-muted">
          Applies to the cover, every card, and every inspection language in this batch. Shipping is one
          shared cost applied to all {items.length || "the"} cars — edit an individual car&rsquo;s price on
          its own detail page first if one needs a different number.
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {CARD_LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                lang === l.code ? "bg-blue-600 text-white" : "bg-navy-surface2 text-navy-muted hover:text-navy-text"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs uppercase tracking-wide text-navy-muted">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="mt-1 w-full rounded-md border border-navy-border bg-navy-surface2 px-2 py-1.5 text-sm text-navy-text"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-navy-muted">Shipping ({currency}, per car)</label>
            <input
              type="number"
              value={shipping}
              placeholder="0"
              onChange={(e) => setShipping(e.target.value === "" ? "" : Number(e.target.value))}
              className="mt-1 w-full rounded-md border border-navy-border bg-navy-surface2 px-2 py-1.5 text-sm text-navy-text"
            />
          </div>
        </div>

        <button
          onClick={generateZip}
          disabled={items.length === 0 || busy}
          className="mt-4 w-full rounded-lg bg-carnect-accent py-2.5 text-sm font-semibold text-carnect disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? progress || "Working…" : "Generate & Download ZIP"}
        </button>
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      </div>
    </div>
  );
}
