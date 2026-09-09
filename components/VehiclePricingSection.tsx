"use client";

import { useState } from "react";
import { Vehicle } from "@/lib/types";
import PriceCalculator from "./PriceCalculator";
import ShareToWhatsAppBlock from "./ShareToWhatsAppBlock";

/**
 * Lifts the deal calculator's computed total (KRW) up to the share block,
 * so the WhatsApp cards always reflect the calculator's real output instead
 * of a manually-typed landed price.
 */
export default function VehiclePricingSection({ vehicle }: { vehicle: Vehicle }) {
  const [totalKrw, setTotalKrw] = useState(vehicle.price_krw);

  return (
    <div className="space-y-4">
      <PriceCalculator vehicle={vehicle} onResultChange={setTotalKrw} />
      <ShareToWhatsAppBlock vehicle={vehicle} totalKrw={totalKrw} />
    </div>
  );
}
