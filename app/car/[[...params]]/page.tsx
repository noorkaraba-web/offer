import { notFound } from "next/navigation";
import { findByListingId } from "@/lib/data";
import PhotoGallery from "@/components/PhotoGallery";
import SpecGrid from "@/components/SpecGrid";
import ConditionBlock from "@/components/ConditionBlock";
import PriceBuilder from "@/components/PriceBuilder";
import ShareBlock from "@/components/ShareBlock";

const SOURCE_LABEL: Record<string, string> = {
  encar: "Encar",
  heydealer: "HeyDealer",
  supercar: "Carnect Exclusive",
};

export default async function VehicleDetailPage({
  params,
}: {
  params: { params?: string[] };
}) {
  const listingId = (params.params ?? []).join("/");
  const vehicle = listingId ? await findByListingId(listingId) : undefined;

  if (!vehicle) notFound();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{vehicle.title_en}</h1>
        <p className="text-sm text-gray-500">
          {SOURCE_LABEL[vehicle.source] ?? vehicle.source} · {vehicle.listing_id}
          {vehicle.plate ? ` · Plate ${vehicle.plate}` : ""}
          {" · "}
          <span className={vehicle.data_origin === "live" ? "text-emerald-600" : "text-amber-600"}>
            {vehicle.data_origin === "live" ? "Live from carnect.biz" : "Mock data (live fetch fell back)"}
          </span>
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
