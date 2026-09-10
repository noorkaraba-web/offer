import { CardLang } from "./cards";
import { EquipmentCategory, EquipmentItem } from "../types";

/**
 * French translations for the equipment/options list. Encar and HeyDealer's
 * own `options` JSON gives us en/ar/ru/es natively (confirmed against real
 * samples — see extractEquipment in lib/carnect-source.ts) but no French, so
 * this fills that one gap. Keyed by the source's own English label (the one
 * language every sample has), since that's a stable common key across both
 * sources. Unmapped items fall back to English and log once, same
 * convention as lib/i18n/condition-terms.ts — never silently show the wrong
 * language.
 */

const CATEGORY_FR: Record<string, string> = {
  "Interior & Exterior": "Intérieur et extérieur",
  Safety: "Sécurité",
  "Convenience & Multimedia": "Confort et multimédia",
  Seats: "Sièges",
  "Driving Assist / Safety": "Aide à la conduite / Sécurité",
};

const ITEM_FR: Record<string, string> = {
  // Interior & Exterior
  "Power door locks": "Verrouillage centralisé des portes",
  "Power windows": "Vitres électriques",
  "Power steering": "Direction assistée",
  "Alloy wheels": "Jantes en alliage",
  "Power-folding side mirrors": "Rétroviseurs rabattables électriquement",
  "Auto-dimming rear-view mirror (ECM)": "Rétroviseur intérieur à atténuation automatique (ECM)",
  "Steering-wheel audio controls": "Commandes audio au volant",
  "Hi-Pass (ETC toll transponder)": "Hi-Pass (télépéage électronique)",
  "Heated steering wheel": "Volant chauffant",
  "Paddle shifters": "Palettes au volant",
  // Safety
  "ABS (anti-lock braking)": "ABS (freinage antiblocage)",
  "Traction control (TCS)": "Contrôle de traction (TCS)",
  "Side airbags": "Airbags latéraux",
  "Driver airbag": "Airbag conducteur",
  "Passenger airbag": "Airbag passager",
  "Rear parking sensors": "Capteurs de stationnement arrière",
  "Tire-pressure monitoring (TPMS)": "Surveillance de la pression des pneus (TPMS)",
  "Electronic stability control (ESC)": "Contrôle électronique de stabilité (ESC)",
  "Curtain airbags": "Airbags rideaux",
  "Lane-departure warning (LDWS)": "Alerte de franchissement de ligne (LDWS)",
  // Convenience & Multimedia
  "Keyless entry (remote door lock)": "Entrée sans clé (verrouillage à distance)",
  "Smart key": "Clé intelligente",
  "Cruise control": "Régulateur de vitesse",
  "USB port": "Port USB",
  "Electronic parking brake (EPB)": "Frein de stationnement électronique (EPB)",
  Bluetooth: "Bluetooth",
  "Automatic headlights": "Feux automatiques",
  // Seats
  "Leather seats": "Sièges en cuir",
  "Heated front seats": "Sièges avant chauffants",
  "Ventilated seat (driver)": "Siège ventilé (conducteur)",
  "Ventilated seat (passenger)": "Siège ventilé (passager)",
  // HeyDealer sample
  "Ventilated Seats (2nd Row)": "Sièges ventilés (2e rangée)",
  "Surround-View Monitor (SVM)": "Caméra de vision à 360° (SVM)",
  "Projection LED Lights Headlights": "Phares LED à projection",
  "Rear Side-View Monitor": "Caméra latérale arrière",
};

const loggedMisses = new Set<string>();

export function translateCategoryFr(category: string, enLabel: string | undefined): string {
  const hit = CATEGORY_FR[enLabel ?? category] ?? CATEGORY_FR[category];
  if (hit) return hit;
  const fallback = enLabel ?? category;
  const missKey = `category:${fallback}`;
  if (!loggedMisses.has(missKey)) {
    loggedMisses.add(missKey);
    console.warn(`[equipment-fr] no French translation for category, showing English: ${JSON.stringify(fallback)}`);
  }
  return fallback;
}

export function translateItemFr(enLabel: string): string {
  const hit = ITEM_FR[enLabel];
  if (hit) return hit;
  const missKey = `item:${enLabel}`;
  if (!loggedMisses.has(missKey)) {
    loggedMisses.add(missKey);
    console.warn(`[equipment-fr] no French translation for item, showing English: ${JSON.stringify(enLabel)}`);
  }
  return enLabel;
}

/** Resolves a category's display label for `lang`: native source label when given, else the French override, else English. */
export function resolveEquipmentCategoryLabel(lang: CardLang, category: EquipmentCategory): string {
  if (lang !== "fr" && category.labels[lang]) return category.labels[lang]!;
  if (lang === "fr") return translateCategoryFr(category.category, category.labels.en);
  return category.labels.en ?? category.category;
}

/** Resolves one equipment item's display label for `lang`, same fallback order as above. */
export function resolveEquipmentItemLabel(lang: CardLang, item: EquipmentItem): string {
  if (lang !== "fr" && item.labels[lang]) return item.labels[lang]!;
  if (lang === "fr") return translateItemFr(item.labels.en ?? item.key);
  return item.labels.en ?? item.key;
}
