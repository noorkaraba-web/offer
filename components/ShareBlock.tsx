"use client";

import { useState } from "react";
import { Vehicle } from "@/lib/types";

export default function ShareBlock({ vehicle }: { vehicle: Vehicle }) {
  const [copied, setCopied] = useState(false);

  const qs = new URLSearchParams({ id: vehicle.listing_id, source: vehicle.source }).toString();
  const vehicleCardUrl = `/api/cards/vehicle?${qs}`;
  const conditionCardUrl = `/api/cards/condition?${qs}`;

  const summary = [
    `${vehicle.title_en}`,
    `${vehicle.year} · ${vehicle.mileage_km.toLocaleString("en-US")} km · ${vehicle.fuel} · ${vehicle.transmission}`,
    `Price: ₩${vehicle.price_krw.toLocaleString("en-US")}`,
    `Condition: Grade ${vehicle.condition.grade} · ${vehicle.condition.insurance_record}`,
    vehicle.url,
  ].join("\n");

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(summary)}`;
  const telegramHref = `https://t.me/share/url?url=${encodeURIComponent(vehicle.url)}&text=${encodeURIComponent(
    summary
  )}`;

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-gray-900">Share card</h3>
      <div className="grid grid-cols-2 gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={vehicleCardUrl} alt="Vehicle card" className="w-full rounded-lg border" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={conditionCardUrl} alt="Condition card" className="w-full rounded-lg border" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <a
          href={vehicleCardUrl}
          download={`carnect-${vehicle.listing_id.replace("/", "-")}-vehicle.png`}
          className="rounded-lg border border-gray-300 py-2 text-center text-sm font-medium"
        >
          Save vehicle card
        </a>
        <a
          href={conditionCardUrl}
          download={`carnect-${vehicle.listing_id.replace("/", "-")}-condition.png`}
          className="rounded-lg border border-gray-300 py-2 text-center text-sm font-medium"
        >
          Save condition card
        </a>
      </div>
      <button
        onClick={async () => {
          await navigator.clipboard.writeText(summary);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="mt-2 w-full rounded-lg border border-gray-300 py-2 text-sm font-medium"
      >
        {copied ? "Copied!" : "Copy text summary"}
      </button>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-[#25D366] py-2 text-center text-sm font-semibold text-white"
        >
          Open WhatsApp
        </a>
        <a
          href={telegramHref}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-[#229ED9] py-2 text-center text-sm font-semibold text-white"
        >
          Open Telegram
        </a>
      </div>
    </div>
  );
}
