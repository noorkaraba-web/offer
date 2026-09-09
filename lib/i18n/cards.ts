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
  | "listingPrice"
  | "landedPrice"
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
  | "brand"
  | "footerTagline";

const STRINGS: Record<CardLang, Record<StringKey, string>> = {
  en: {
    listingPrice: "Listing price",
    landedPrice: "Landed price",
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
    brand: "CARNECT",
    footerTagline: "Korean Used Car Exporter",
  },
  ar: {
    listingPrice: "سعر الإدراج",
    landedPrice: "السعر شامل الشحن",
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
    brand: "كارنكت",
    footerTagline: "مُصدّر سيارات كورية مستعملة",
  },
  ru: {
    listingPrice: "Цена",
    landedPrice: "Цена с доставкой",
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
    brand: "CARNECT",
    footerTagline: "Экспорт подержанных автомобилей из Кореи",
  },
  fr: {
    listingPrice: "Prix affiché",
    landedPrice: "Prix rendu (livré)",
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
    brand: "CARNECT",
    footerTagline: "Exportateur de voitures d'occasion coréennes",
  },
  es: {
    listingPrice: "Precio de venta",
    landedPrice: "Precio total (con envío)",
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
    brand: "CARNECT",
    footerTagline: "Exportador de coches usados de Corea",
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
