import { notFound } from "next/navigation";
import { findByListingId } from "@/lib/data";
import PhotoGallery from "@/components/PhotoGallery";
import VehicleHeader from "@/components/VehicleHeader";
import SpecGrid from "@/components/SpecGrid";
import ConditionAccidentBlock from "@/components/ConditionAccidentBlock";
import PriceBuilder from "@/components/PriceBuilder";
import ShareToWhatsAppBlock from "@/components/ShareToWhatsAppBlock";

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
      <p className="text-xs text-navy-muted">
        {SOURCE_LABEL[vehicle.source] ?? vehicle.source} · {vehicle.listing_id}
        {" · "}
        <span className={vehicle.data_origin === "live" ? "text-emerald-400" : "text-amber-400"}>
          {vehicle.data_origin === "live" ? "Live from carnect.biz" : "Mock data (live fetch fell back)"}
        </span>
      </p>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <PhotoGallery photos={vehicle.photos} alt={vehicle.title_en} />
        </div>
        <div className="lg:col-span-2">
          <VehicleHeader vehicle={vehicle} />
        </div>
      </div>

      <ConditionAccidentBlock condition={vehicle.condition} />
      <ShareToWhatsAppBlock vehicle={vehicle} />
      <PriceBuilder vehicle={vehicle} />
      <SpecGrid vehicle={vehicle} />
    </div>
  );
}
