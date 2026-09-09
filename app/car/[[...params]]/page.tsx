import { notFound } from "next/navigation";
import { findByListingId } from "@/lib/data";
import PhotoGallery from "@/components/PhotoGallery";
import SpecGrid from "@/components/SpecGrid";
import ConditionBlock from "@/components/ConditionBlock";
import PriceBuilder from "@/components/PriceBuilder";
import ShareBlock from "@/components/ShareBlock";

export default function VehicleDetailPage({
  params,
}: {
  params: { params?: string[] };
}) {
  const listingId = (params.params ?? []).join("/");
  const vehicle = listingId ? findByListingId(listingId) : undefined;

  if (!vehicle) notFound();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{vehicle.title_en}</h1>
        <p className="text-sm text-gray-500">
          {vehicle.source === "encar" ? "Encar" : "HeyDealer"} · {vehicle.listing_id}
          {vehicle.plate ? ` · Plate ${vehicle.plate}` : ""}
        </p>
      </div>

      <PhotoGallery photos={vehicle.photos} alt={vehicle.title_en} />
      <SpecGrid vehicle={vehicle} />
      <ConditionBlock condition={vehicle.condition} />
      <PriceBuilder vehicle={vehicle} />
      <ShareBlock vehicle={vehicle} />
    </div>
  );
}
