"use client";

import { useEffect, useRef, useState } from "react";
import { Vehicle, Currency, FxRates } from "@/lib/types";
import { convertFromKrw } from "@/lib/fx";
import { CARD_LANGUAGES, CardLang } from "@/lib/i18n/cards";

const CURRENCIES: Currency[] = ["USD", "EUR", "AED", "KRW", "JPY", "GBP", "CAD", "AUD"];

export default function ShareToWhatsAppBlock({ vehicle, totalKrw }: { vehicle: Vehicle; totalKrw: number }) {
  const [lang, setLang] = useState<CardLang>("en");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [rates, setRates] = useState<FxRates | null>(null);
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const vehicleCardLinkRef = useRef<HTMLAnchorElement>(null);
  const inspectionCardLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    fetch("/api/fx?base=KRW")
      .then((r) => r.json())
      .then((r: FxRates) => setRates(r))
      .catch(() => setRates(null));
  }, []);

  // Landed price is derived from the deal calculator's total (KRW), not
  // typed manually — it updates automatically as the calculator or the
  // currency selector below changes.
  const landedPrice = rates ? Math.round(convertFromKrw(totalKrw, currency, rates)) : 0;

  const qs = new URLSearchParams({
    id: vehicle.listing_id,
    source: vehicle.source,
    lang,
    currency,
    landedPrice: String(landedPrice || 0),
  }).toString();
  const vehicleCardUrl = `/api/cards/vehicle?${qs}`;
  const inspectionCardUrl = `/api/cards/condition?${qs}`;

  const summary = [
    vehicle.title_en,
    `${vehicle.year} · ${vehicle.mileage_km.toLocaleString("en-US")} km`,
    landedPrice ? `Landed price: ${currency} ${Number(landedPrice).toLocaleString("en-US")}` : "",
    vehicle.url,
  ]
    .filter(Boolean)
    .join("\n");

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(summary)}`;

  return (
    <div className="rounded-xl border border-navy-border bg-navy-surface p-4">
      <h3 className="text-sm font-semibold text-navy-text">📤 Share to WhatsApp</h3>
      <p className="mt-1 text-xs text-navy-muted">
        Pick the customer&rsquo;s language and currency, then generate the images. Landed price comes
        from the deal calculator&rsquo;s total above.
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

      <div className="mt-3 flex gap-2">
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value as Currency)}
          className="rounded-md border border-navy-border bg-navy-surface2 px-2 py-2 text-sm text-navy-text"
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <div className="flex flex-1 items-center rounded-md border border-navy-border bg-navy-surface2 px-3 py-2 text-sm text-navy-text">
          {rates ? landedPrice.toLocaleString("en-US") : "Loading rates…"}
        </div>
        <button
          onClick={() => setGenerated(true)}
          className="whitespace-nowrap rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
        >
          📤 Share to WhatsApp
        </button>
      </div>

      {generated && (
        <>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={vehicleCardUrl} alt="Vehicle card" className="w-full rounded-lg border border-navy-border" />
              <p className="mt-1 text-center text-xs uppercase tracking-wide text-navy-muted">Vehicle card</p>
              <a
                ref={vehicleCardLinkRef}
                href={vehicleCardUrl}
                download={`carnect-${vehicle.listing_id.replace(/\//g, "-")}-vehicle-${lang}.png`}
                className="mt-1 block rounded-lg border border-navy-border py-1.5 text-center text-xs font-medium text-navy-text"
              >
                ⬇ Save
              </a>
            </div>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={inspectionCardUrl}
                alt="Inspection report card"
                className="w-full rounded-lg border border-navy-border"
              />
              <p className="mt-1 text-center text-xs uppercase tracking-wide text-navy-muted">Inspection report</p>
              <a
                ref={inspectionCardLinkRef}
                href={inspectionCardUrl}
                download={`carnect-${vehicle.listing_id.replace(/\//g, "-")}-inspection-${lang}.png`}
                className="mt-1 block rounded-lg border border-navy-border py-1.5 text-center text-xs font-medium text-navy-text"
              >
                ⬇ Save
              </a>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                vehicleCardLinkRef.current?.click();
                inspectionCardLinkRef.current?.click();
              }}
              className="rounded-lg bg-navy-surface2 py-2 text-center text-xs font-medium text-navy-text"
            >
              ⬇ Save both images
            </button>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-[#25D366] py-2 text-center text-xs font-semibold text-white"
            >
              Open WhatsApp ↗
            </a>
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(summary);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="rounded-lg bg-navy-surface2 py-2 text-center text-xs font-medium text-navy-text"
            >
              📋 {copied ? "Copied!" : "Copy text"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
