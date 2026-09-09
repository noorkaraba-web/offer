import { Vehicle } from "@/lib/types";

export default function SpecGrid({ vehicle }: { vehicle: Vehicle }) {
  const rows: [string, string][] = [
    ["Brand", vehicle.brand],
    ["Model", vehicle.model],
    ["Colour", vehicle.color],
    ["Body", vehicle.body],
    ...(vehicle.engine_cc != null ? ([["Engine", `${vehicle.engine_cc.toLocaleString("en-US")} cc`]] as [string, string][]) : []),
    ...(vehicle.seats != null ? ([["Seats", String(vehicle.seats)]] as [string, string][]) : []),
    ...(vehicle.vin ? ([["VIN", vehicle.vin]] as [string, string][]) : []),
    ["Listing ID", vehicle.listing_id],
  ];

  return (
    <div className="rounded-xl border border-navy-border bg-navy-surface p-4">
      <h3 className="mb-3 text-sm font-semibold text-navy-text">📄 Full specifications</h3>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-lg bg-navy-surface2 p-3">
            <dt className="text-xs uppercase tracking-wide text-navy-muted">{label}</dt>
            <dd className="mt-1 truncate text-sm font-medium text-navy-text">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
