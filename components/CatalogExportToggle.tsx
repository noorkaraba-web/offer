"use client";

import Link from "next/link";
import { Vehicle } from "@/lib/types";
import { useCatalogExport, CATALOG_EXPORT_MAX_ITEMS } from "@/lib/catalog-export-context";

export default function CatalogExportToggle({ vehicle }: { vehicle: Vehicle }) {
  const { items, addItem, removeItem, hasItem } = useCatalogExport();
  const added = hasItem(vehicle.listing_id);
  const full = items.length >= CATALOG_EXPORT_MAX_ITEMS && !added;

  return (
    <div className="flex items-center justify-between rounded-xl border border-navy-border bg-navy-surface p-4">
      <div>
        <h3 className="text-sm font-semibold text-navy-text">Catalog export</h3>
        <p className="mt-0.5 text-xs text-navy-muted">
          Sending several cars at once? Add each to the batch, then generate all their cards + a zip in
          one go.{" "}
          <Link href="/catalog-export" className="text-carnect-accent underline">
            View batch ({items.length})
          </Link>
        </p>
      </div>
      <button
        onClick={() =>
          added
            ? removeItem(vehicle.listing_id)
            : addItem({ listing_id: vehicle.listing_id, source: vehicle.source, title_en: vehicle.title_en })
        }
        disabled={full}
        className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold ${
          added
            ? "border border-navy-border text-navy-muted"
            : full
            ? "cursor-not-allowed bg-navy-surface2 text-navy-muted"
            : "bg-carnect-accent text-carnect"
        }`}
      >
        {added ? "Remove from batch" : full ? "Batch full (20)" : "+ Add to batch"}
      </button>
    </div>
  );
}
