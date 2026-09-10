import { CardLang, CARD_LANGUAGES, dirFor } from "./cards";

/**
 * Chrome strings for the public /{lang}/catalog/{id} pages — sections,
 * labels, and share/contact copy that don't already exist in
 * lib/i18n/cards.ts (the PNG share-card dictionary, reused directly for the
 * condition/inspection vocabulary this page also needs — see CatalogPage).
 * Machine-translated by me for this build, not professionally reviewed,
 * same caveat as cards.ts.
 */

export { CardLang, CARD_LANGUAGES, dirFor };

type StringKey =
  | "metaDescriptionTagline"
  | "galleryTitle"
  | "specsTitle"
  | "equipmentTitle"
  | "conditionTitle"
  | "insuranceHistoryTitle"
  | "insuranceNoAccidents"
  | "insuranceMyAccidents"
  | "insuranceOtherAccidents"
  | "insuranceTotalLoss"
  | "insuranceFloodLoss"
  | "insuranceOwnerChanges"
  | "insuranceTheft"
  | "fobPriceTitle"
  | "fobPriceNote"
  | "contactTitle"
  | "whatsappCta"
  | "whatsappMessageTemplate"
  | "shareTitle"
  | "copyLink"
  | "linkCopied"
  | "shareWhatsapp"
  | "shareTelegram"
  | "languageLabel"
  | "viewOriginalListing"
  | "colorLabel"
  | "fuelLabel"
  | "transmissionLabel"
  | "bodyLabel"
  | "engineLabel"
  | "seatsLabel"
  | "plateLabel"
  | "notAvailableShort";

const STRINGS: Record<CardLang, Record<StringKey, string>> = {
  en: {
    metaDescriptionTagline: "Turnkey price with delivery",
    galleryTitle: "Photos",
    specsTitle: "Specifications",
    equipmentTitle: "Equipment",
    conditionTitle: "Condition & Inspection Report",
    insuranceHistoryTitle: "Insurance History",
    insuranceNoAccidents: "No accidents on record",
    insuranceMyAccidents: "{n} accident(s) on this vehicle",
    insuranceOtherAccidents: "{n} accident(s) involving the other party",
    insuranceTotalLoss: "Total loss on record",
    insuranceFloodLoss: "Flood damage on record",
    insuranceOwnerChanges: "{n} previous owner(s)",
    insuranceTheft: "Theft record on file",
    fobPriceTitle: "FOB Price",
    fobPriceNote: "Free On Board, Korea port — before shipping",
    contactTitle: "Contact us",
    whatsappCta: "Contact us on WhatsApp",
    whatsappMessageTemplate: "Hi, I'm interested in this {title} (plate {plate}). Listing: {url}",
    shareTitle: "Share this listing",
    copyLink: "Copy link",
    linkCopied: "Link copied!",
    shareWhatsapp: "WhatsApp",
    shareTelegram: "Telegram",
    languageLabel: "Language",
    viewOriginalListing: "View original listing",
    colorLabel: "Colour",
    fuelLabel: "Fuel",
    transmissionLabel: "Transmission",
    bodyLabel: "Body type",
    engineLabel: "Engine",
    seatsLabel: "Seats",
    plateLabel: "Plate",
    notAvailableShort: "—",
  },
  ar: {
    metaDescriptionTagline: "سعر جاهز شامل التوصيل",
    galleryTitle: "الصور",
    specsTitle: "المواصفات",
    equipmentTitle: "التجهيزات",
    conditionTitle: "الحالة وتقرير الفحص",
    insuranceHistoryTitle: "سجل التأمين",
    insuranceNoAccidents: "لا توجد حوادث مسجلة",
    insuranceMyAccidents: "{n} حادث لهذه السيارة",
    insuranceOtherAccidents: "{n} حادث للطرف الآخر",
    insuranceTotalLoss: "خسارة كلية مسجلة",
    insuranceFloodLoss: "أضرار غمر بالمياه مسجلة",
    insuranceOwnerChanges: "{n} مالك سابق",
    insuranceTheft: "سجل سرقة موثق",
    fobPriceTitle: "سعر FOB",
    fobPriceNote: "تسليم على متن السفينة، ميناء كوريا — قبل الشحن",
    contactTitle: "تواصل معنا",
    whatsappCta: "تواصل معنا عبر واتساب",
    whatsappMessageTemplate: "مرحباً، أنا مهتم بهذه السيارة {title} (رقم اللوحة {plate}). رابط الإعلان: {url}",
    shareTitle: "شارك هذا الإعلان",
    copyLink: "نسخ الرابط",
    linkCopied: "تم نسخ الرابط!",
    shareWhatsapp: "واتساب",
    shareTelegram: "تيليجرام",
    languageLabel: "اللغة",
    viewOriginalListing: "عرض الإعلان الأصلي",
    colorLabel: "اللون",
    fuelLabel: "نوع الوقود",
    transmissionLabel: "ناقل الحركة",
    bodyLabel: "نوع الهيكل",
    engineLabel: "المحرك",
    seatsLabel: "المقاعد",
    plateLabel: "رقم اللوحة",
    notAvailableShort: "—",
  },
  ru: {
    metaDescriptionTagline: "Цена под ключ с доставкой",
    galleryTitle: "Фотографии",
    specsTitle: "Характеристики",
    equipmentTitle: "Комплектация",
    conditionTitle: "Состояние и отчёт об осмотре",
    insuranceHistoryTitle: "Страховая история",
    insuranceNoAccidents: "Аварий не зафиксировано",
    insuranceMyAccidents: "{n} авари(я/й) с участием этого автомобиля",
    insuranceOtherAccidents: "{n} авари(я/й) по вине другой стороны",
    insuranceTotalLoss: "Зафиксирована полная гибель",
    insuranceFloodLoss: "Зафиксировано повреждение затоплением",
    insuranceOwnerChanges: "{n} предыдущих владельцев",
    insuranceTheft: "Есть запись об угоне",
    fobPriceTitle: "Цена FOB",
    fobPriceNote: "Свободно на борту, порт Кореи — без учёта доставки",
    contactTitle: "Связаться с нами",
    whatsappCta: "Написать в WhatsApp",
    whatsappMessageTemplate: "Здравствуйте, меня интересует {title} (номер {plate}). Ссылка: {url}",
    shareTitle: "Поделиться объявлением",
    copyLink: "Скопировать ссылку",
    linkCopied: "Ссылка скопирована!",
    shareWhatsapp: "WhatsApp",
    shareTelegram: "Telegram",
    languageLabel: "Язык",
    viewOriginalListing: "Посмотреть оригинал объявления",
    colorLabel: "Цвет",
    fuelLabel: "Топливо",
    transmissionLabel: "Коробка передач",
    bodyLabel: "Тип кузова",
    engineLabel: "Двигатель",
    seatsLabel: "Мест",
    plateLabel: "Номер",
    notAvailableShort: "—",
  },
  fr: {
    metaDescriptionTagline: "Prix clé en main, livraison incluse",
    galleryTitle: "Photos",
    specsTitle: "Caractéristiques",
    equipmentTitle: "Équipements",
    conditionTitle: "État et rapport d'inspection",
    insuranceHistoryTitle: "Historique d'assurance",
    insuranceNoAccidents: "Aucun accident enregistré",
    insuranceMyAccidents: "{n} accident(s) pour ce véhicule",
    insuranceOtherAccidents: "{n} accident(s) impliquant l'autre partie",
    insuranceTotalLoss: "Perte totale enregistrée",
    insuranceFloodLoss: "Dégât des eaux enregistré",
    insuranceOwnerChanges: "{n} propriétaire(s) précédent(s)",
    insuranceTheft: "Antécédent de vol enregistré",
    fobPriceTitle: "Prix FOB",
    fobPriceNote: "Franco à bord, port de Corée — avant expédition",
    contactTitle: "Nous contacter",
    whatsappCta: "Nous contacter sur WhatsApp",
    whatsappMessageTemplate: "Bonjour, je suis intéressé(e) par ce véhicule {title} (plaque {plate}). Annonce : {url}",
    shareTitle: "Partager cette annonce",
    copyLink: "Copier le lien",
    linkCopied: "Lien copié !",
    shareWhatsapp: "WhatsApp",
    shareTelegram: "Telegram",
    languageLabel: "Langue",
    viewOriginalListing: "Voir l'annonce d'origine",
    colorLabel: "Couleur",
    fuelLabel: "Carburant",
    transmissionLabel: "Transmission",
    bodyLabel: "Type de carrosserie",
    engineLabel: "Moteur",
    seatsLabel: "Places",
    plateLabel: "Plaque",
    notAvailableShort: "—",
  },
  es: {
    metaDescriptionTagline: "Precio llave en mano con entrega",
    galleryTitle: "Fotos",
    specsTitle: "Especificaciones",
    equipmentTitle: "Equipamiento",
    conditionTitle: "Estado e informe de inspección",
    insuranceHistoryTitle: "Historial de seguro",
    insuranceNoAccidents: "Sin accidentes registrados",
    insuranceMyAccidents: "{n} accidente(s) de este vehículo",
    insuranceOtherAccidents: "{n} accidente(s) por culpa de terceros",
    insuranceTotalLoss: "Pérdida total registrada",
    insuranceFloodLoss: "Daño por inundación registrado",
    insuranceOwnerChanges: "{n} propietario(s) anterior(es)",
    insuranceTheft: "Antecedente de robo registrado",
    fobPriceTitle: "Precio FOB",
    fobPriceNote: "Franco a bordo, puerto de Corea — antes del envío",
    contactTitle: "Contáctanos",
    whatsappCta: "Contáctanos por WhatsApp",
    whatsappMessageTemplate: "Hola, estoy interesado en este {title} (matrícula {plate}). Anuncio: {url}",
    shareTitle: "Compartir este anuncio",
    copyLink: "Copiar enlace",
    linkCopied: "¡Enlace copiado!",
    shareWhatsapp: "WhatsApp",
    shareTelegram: "Telegram",
    languageLabel: "Idioma",
    viewOriginalListing: "Ver anuncio original",
    colorLabel: "Color",
    fuelLabel: "Combustible",
    transmissionLabel: "Transmisión",
    bodyLabel: "Tipo de carrocería",
    engineLabel: "Motor",
    seatsLabel: "Plazas",
    plateLabel: "Matrícula",
    notAvailableShort: "—",
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
