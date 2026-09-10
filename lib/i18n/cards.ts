/**
 * Translations for the two generated share-card images (vehicle card +
 * inspection report). Machine-translated by me for this build, not
 * professionally reviewed — treat as a solid starting point, not final copy.
 */

export type CardLang = "en" | "ar" | "ru" | "fr" | "es";

export const CARD_LANGUAGES: { code: CardLang; label: string; dir: "ltr" | "rtl" }[] = [
  { code: "en", label: "English", dir: "ltr" },
  { code: "ar", label: "العربية", dir: "rtl" },
  { code: "ru", label: "Русский", dir: "ltr" },
  { code: "fr", label: "Français", dir: "ltr" },
  { code: "es", label: "Español", dir: "ltr" },
];

type StringKey =
  | "carPriceLabel"
  | "shippingCostLabel"
  | "priceIncludingDelivery"
  | "regDate"
  | "mileage"
  | "vin"
  | "structuralDamage"
  | "panelsAffected"
  | "noAccidentRecord"
  | "inspectionReportTitle"
  | "grade"
  | "insuranceRecord"
  | "diagnosis"
  | "inspection"
  | "sheetAvailable"
  | "notAvailable"
  | "yes"
  | "no"
  | "normal"
  | "replaced"
  | "welded"
  | "corrosion"
  | "unknownStatus"
  | "structuralRepairsTitle"
  | "waterDamage"
  | "modification"
  | "recall"
  | "basicStructureDamage"
  | "allPanelsNormal"
  | "vehiclesCount"
  | "catalogCoverTagline";

const STRINGS: Record<CardLang, Record<StringKey, string>> = {
  en: {
    carPriceLabel: "Car price",
    shippingCostLabel: "Shipping",
    priceIncludingDelivery: "Price including delivery",
    regDate: "Reg. date",
    mileage: "Mileage",
    vin: "VIN",
    structuralDamage: "Structural damage",
    panelsAffected: "{n} panels affected",
    noAccidentRecord: "No accident on record",
    inspectionReportTitle: "Inspection report",
    grade: "Grade",
    insuranceRecord: "Insurance record",
    diagnosis: "Diagnosis",
    inspection: "Inspection",
    sheetAvailable: "Sheet available",
    notAvailable: "Not available",
    yes: "Yes",
    no: "No",
    normal: "Normal",
    replaced: "Replaced",
    welded: "Welded / panel beaten",
    corrosion: "Corrosion",
    unknownStatus: "Reported",
    structuralRepairsTitle: "Structural repairs",
    waterDamage: "Water damage",
    modification: "Modification",
    recall: "Recall",
    basicStructureDamage: "Basic structure",
    allPanelsNormal: "All panels normal",
    vehiclesCount: "{n} Vehicles",
    catalogCoverTagline: "Turnkey price with delivery",
  },
  ar: {
    carPriceLabel: "سعر السيارة",
    shippingCostLabel: "الشحن",
    priceIncludingDelivery: "السعر شامل التوصيل",
    regDate: "تاريخ التسجيل",
    mileage: "المسافة المقطوعة",
    vin: "رقم الهيكل",
    structuralDamage: "ضرر هيكلي",
    panelsAffected: "{n} ألواح متأثرة",
    noAccidentRecord: "لا يوجد سجل حوادث",
    inspectionReportTitle: "تقرير الفحص",
    grade: "الدرجة",
    insuranceRecord: "سجل التأمين",
    diagnosis: "التشخيص",
    inspection: "الفحص",
    sheetAvailable: "التقرير متوفر",
    notAvailable: "غير متوفر",
    yes: "نعم",
    no: "لا",
    normal: "طبيعي",
    replaced: "تم الاستبدال",
    welded: "لحام / طرق",
    corrosion: "تآكل",
    unknownStatus: "تم الإبلاغ عنه",
    structuralRepairsTitle: "إصلاحات الهيكل",
    waterDamage: "ضرر المياه",
    modification: "تعديل",
    recall: "استدعاء",
    basicStructureDamage: "الهيكل الأساسي",
    allPanelsNormal: "جميع الألواح طبيعية",
    vehiclesCount: "{n} سيارة",
    catalogCoverTagline: "سعر جاهز شامل التوصيل",
  },
  ru: {
    carPriceLabel: "Цена автомобиля",
    shippingCostLabel: "Доставка",
    priceIncludingDelivery: "Цена с доставкой",
    regDate: "Дата регистрации",
    mileage: "Пробег",
    vin: "VIN",
    structuralDamage: "Повреждение кузова",
    panelsAffected: "{n} панелей повреждено",
    noAccidentRecord: "Нет записей об авариях",
    inspectionReportTitle: "Отчёт об осмотре",
    grade: "Класс",
    insuranceRecord: "Страховая история",
    diagnosis: "Диагностика",
    inspection: "Осмотр",
    sheetAvailable: "Отчёт доступен",
    notAvailable: "Недоступно",
    yes: "Да",
    no: "Нет",
    normal: "Норма",
    replaced: "Заменено",
    welded: "Сварка / рихтовка",
    corrosion: "Коррозия",
    unknownStatus: "Указано",
    structuralRepairsTitle: "Кузовной ремонт",
    waterDamage: "Затопление",
    modification: "Модификация",
    recall: "Отзыв",
    basicStructureDamage: "Повреждение кузова",
    allPanelsNormal: "Все панели в норме",
    vehiclesCount: "{n} автомобилей",
    catalogCoverTagline: "Цена под ключ с доставкой",
  },
  fr: {
    carPriceLabel: "Prix du véhicule",
    shippingCostLabel: "Livraison",
    priceIncludingDelivery: "Prix, livraison incluse",
    regDate: "Date d'immatriculation",
    mileage: "Kilométrage",
    vin: "VIN",
    structuralDamage: "Dommages structurels",
    panelsAffected: "{n} panneaux affectés",
    noAccidentRecord: "Aucun accident enregistré",
    inspectionReportTitle: "Rapport d'inspection",
    grade: "Note",
    insuranceRecord: "Historique d'assurance",
    diagnosis: "Diagnostic",
    inspection: "Inspection",
    sheetAvailable: "Rapport disponible",
    notAvailable: "Non disponible",
    yes: "Oui",
    no: "Non",
    normal: "Normal",
    replaced: "Remplacé",
    welded: "Soudé / redressé",
    corrosion: "Corrosion",
    unknownStatus: "Signalé",
    structuralRepairsTitle: "Réparations structurelles",
    waterDamage: "Dégât des eaux",
    modification: "Modification",
    recall: "Rappel",
    basicStructureDamage: "Structure de base",
    allPanelsNormal: "Tous les panneaux sont normaux",
    vehiclesCount: "{n} véhicules",
    catalogCoverTagline: "Prix clé en main, livraison incluse",
  },
  es: {
    carPriceLabel: "Precio del vehículo",
    shippingCostLabel: "Envío",
    priceIncludingDelivery: "Precio con envío incluido",
    regDate: "Fecha de matriculación",
    mileage: "Kilometraje",
    vin: "VIN",
    structuralDamage: "Daño estructural",
    panelsAffected: "{n} paneles afectados",
    noAccidentRecord: "Sin accidentes registrados",
    inspectionReportTitle: "Informe de inspección",
    grade: "Grado",
    insuranceRecord: "Historial de seguro",
    diagnosis: "Diagnóstico",
    inspection: "Inspección",
    sheetAvailable: "Informe disponible",
    notAvailable: "No disponible",
    yes: "Sí",
    no: "No",
    normal: "Normal",
    replaced: "Reemplazado",
    welded: "Soldado / enderezado",
    corrosion: "Corrosión",
    unknownStatus: "Reportado",
    structuralRepairsTitle: "Reparaciones estructurales",
    waterDamage: "Daño por agua",
    modification: "Modificación",
    recall: "Retirada (recall)",
    basicStructureDamage: "Estructura básica",
    allPanelsNormal: "Todos los paneles normales",
    vehiclesCount: "{n} vehículos",
    catalogCoverTagline: "Precio llave en mano con entrega",
  },
};

export function t(lang: CardLang, key: StringKey, vars?: Record<string, string | number>): string {
  const table = STRINGS[lang] ?? STRINGS.en;
  let str = table[key] ?? STRINGS.en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(`{${k}}`, String(v));
    }
  }
  return str;
}

export function dirFor(lang: CardLang): "ltr" | "rtl" {
  return CARD_LANGUAGES.find((l) => l.code === lang)?.dir ?? "ltr";
}

export function statusLabel(lang: CardLang, statusCode: string): string {
  switch (statusCode) {
    case "normal":
      return t(lang, "normal");
    case "replaced":
      return t(lang, "replaced");
    case "welded":
      return t(lang, "welded");
    case "corrosion":
      return t(lang, "corrosion");
    default:
      return t(lang, "unknownStatus");
  }
}
