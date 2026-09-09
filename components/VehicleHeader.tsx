"use client";

import { useEffect, useState } from "react";
import { Vehicle, FxRates } from "@/lib/types";
import { convertFromKrw } from "@/lib/fx";
import { formatMoney } from "@/lib/pricing";

export default function VehicleHeader({ vehicle }: { vehicle: Vehicle }) {
  const [rates, setRates] = useState<FxRates | null>(null);

  useEffect(() => {
    fetch("/api/fx?base=KRW")
      .then((r) => r.json())
      .then(setRates)
      .catch(() => setRates(null));
  }, []);

  const subtitleParts = [vehicle.trim, String(vehicle.year), `${vehicle.mileage_km.toLocaleString("en-US")} km`].filter(
    Boolean
  );

  return (
    <div className="rounded-xl border border-navy-border bg-navy-surface p-4">
      {vehicle.plate && (
        <span className="mb-2 inline-block rounded-md bg-plate px-2.5 py-1 text-sm font-bold text-plate-text">
          {vehicle.plate}
        </span>
      )}
      <h1 className="text-xl font-bold text-navy-text">{vehicle.title_en}</h1>
      <p className="mt-0.5 text-sm text-navy-muted">{subtitleParts.join(" · ")}</p>

      <div className="mt-4 rounded-lg bg-navy-surface2 p-3">
        <p className="text-2xl font-bold text-navy-text">₩{vehicle.price_krw.toLocaleString("en-US")}</p>
        {rates && (
          <p className="mt-1 text-sm text-navy-muted">
            {formatMoney(convertFromKrw(vehicle.price_krw, "USD", rates), "USD")} ·{" "}
            {formatMoney(convertFromKrw(vehicle.price_krw, "EUR", rates), "EUR")}
          </p>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <KeyFact label="Year" value={String(vehicle.year)} />
        <KeyFact label="Mileage" value={`${vehicle.mileage_km.toLocaleString("en-US")} km`} />
        <KeyFact label="Fuel" value={vehicle.fuel} />
        <KeyFact label="Transmission" value={vehicle.transmission} />
      </div>

      <a
        href={vehicle.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 block w-full rounded-lg border border-navy-border py-2 text-center text-sm font-medium text-navy-text hover:bg-navy-surface2"
      >
        View original listing ↗
      </a>
    </div>
  );
}

function KeyFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-navy-surface2 p-2.5">
      <p className="text-xs uppercase tracking-wide text-navy-muted">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-navy-text">{value}</p>
    </div>
  );
}
