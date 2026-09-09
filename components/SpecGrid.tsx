import { Vehicle } from "@/lib/types";

export default function SpecGrid({ vehicle }: { vehicle: Vehicle }) {
  const rows: [string, string][] = [
    ["Year", String(vehicle.year)],
    ["Registered", vehicle.reg_date],
    ["Mileage", `${vehicle.mileage_km.toLocaleString("en-US")} km`],
    ["Fuel", vehicle.fuel],
    ["Transmission", vehicle.transmission],
    ...(vehicle.engine_cc != null ? ([["Engine", `${vehicle.engine_cc.toLocaleString("en-US")} cc`]] as [string, string][]) : []),
    ["Color", vehicle.color],
    ["Body", vehicle.body],
    ...(vehicle.seats != null ? ([["Seats", String(vehicle.seats)]] as [string, string][]) : []),
    ...(vehicle.vin ? ([["VIN", vehicle.vin]] as [string, string][]) : []),
  ];

  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl bg-white p-4 shadow-sm sm:grid-cols-3">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt className="text-xs uppercase tracking-wide text-gray-500">{label}</dt>
          <dd className="text-sm font-medium text-gray-900">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
