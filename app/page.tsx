import { VEHICLES } from "@/lib/data";
import SearchScreen from "@/components/SearchScreen";

export default function HomePage() {
  const total = VEHICLES.length;
  const withPlate = VEHICLES.filter((v) => v.plate).length;
  const bySource = {
    encar: VEHICLES.filter((v) => v.source === "encar").length,
    heydealer: VEHICLES.filter((v) => v.source === "heydealer").length,
  };

  return (
    <SearchScreen
      indexCounters={{ total, withPlate, ...bySource }}
    />
  );
}
