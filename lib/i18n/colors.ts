import { CardLang } from "./cards";

/**
 * Colour-name translation for the public catalog page. carnect.biz's own
 * spec table already gives colour in English (confirmed against a real
 * listing: "Color: Silver Gray"), but paint names are usually a hue word
 * plus a marketing/proper-noun modifier ("Uyuni White", "Abyss Black
 * Pearl", "Selenite Grey") that doesn't have a real translation — the
 * modifier is kept as-is (same convention real dealership listings use) and
 * only the recognized hue word(s) are translated. This is the fix for the
 * exact bug MDM's reference page has: it leaves colour untranslated
 * (Russian) on its Arabic page.
 */

type WordMap = Record<CardLang, string>;

const BASE_WORDS: Record<string, WordMap> = {
  black: { en: "Black", ar: "أسود", ru: "Чёрный", fr: "Noir", es: "Negro" },
  white: { en: "White", ar: "أبيض", ru: "Белый", fr: "Blanc", es: "Blanco" },
  silver: { en: "Silver", ar: "فضي", ru: "Серебристый", fr: "Argent", es: "Plata" },
  gray: { en: "Gray", ar: "رمادي", ru: "Серый", fr: "Gris", es: "Gris" },
  grey: { en: "Grey", ar: "رمادي", ru: "Серый", fr: "Gris", es: "Gris" },
  blue: { en: "Blue", ar: "أزرق", ru: "Синий", fr: "Bleu", es: "Azul" },
  navy: { en: "Navy", ar: "كحلي", ru: "Тёмно-синий", fr: "Bleu marine", es: "Azul marino" },
  red: { en: "Red", ar: "أحمر", ru: "Красный", fr: "Rouge", es: "Rojo" },
  green: { en: "Green", ar: "أخضر", ru: "Зелёный", fr: "Vert", es: "Verde" },
  brown: { en: "Brown", ar: "بني", ru: "Коричневый", fr: "Marron", es: "Marrón" },
  beige: { en: "Beige", ar: "بيج", ru: "Бежевый", fr: "Beige", es: "Beige" },
  gold: { en: "Gold", ar: "ذهبي", ru: "Золотистый", fr: "Doré", es: "Dorado" },
  yellow: { en: "Yellow", ar: "أصفر", ru: "Жёлтый", fr: "Jaune", es: "Amarillo" },
  orange: { en: "Orange", ar: "برتقالي", ru: "Оранжевый", fr: "Orange", es: "Naranja" },
  purple: { en: "Purple", ar: "بنفسجي", ru: "Фиолетовый", fr: "Violet", es: "Morado" },
  violet: { en: "Violet", ar: "بنفسجي", ru: "Фиолетовый", fr: "Violet", es: "Violeta" },
  bronze: { en: "Bronze", ar: "برونزي", ru: "Бронзовый", fr: "Bronze", es: "Bronce" },
  champagne: { en: "Champagne", ar: "شمبانيا", ru: "Шампань", fr: "Champagne", es: "Champán" },
  pearl: { en: "Pearl", ar: "لؤلؤي", ru: "Перламутровый", fr: "Nacré", es: "Perlado" },
  metallic: { en: "Metallic", ar: "معدني", ru: "Металлик", fr: "Métallisé", es: "Metalizado" },
  dark: { en: "Dark", ar: "غامق", ru: "Тёмный", fr: "Foncé", es: "Oscuro" },
  light: { en: "Light", ar: "فاتح", ru: "Светлый", fr: "Clair", es: "Claro" },
  charcoal: { en: "Charcoal", ar: "رمادي فحمي", ru: "Угольный", fr: "Anthracite", es: "Antracita" },
  graphite: { en: "Graphite", ar: "غرافيتي", ru: "Графитовый", fr: "Graphite", es: "Grafito" },
  ivory: { en: "Ivory", ar: "عاجي", ru: "Слоновая кость", fr: "Ivoire", es: "Marfil" },
  cream: { en: "Cream", ar: "كريمي", ru: "Кремовый", fr: "Crème", es: "Crema" },
  copper: { en: "Copper", ar: "نحاسي", ru: "Медный", fr: "Cuivre", es: "Cobre" },
  maroon: { en: "Maroon", ar: "عنابي", ru: "Бордовый", fr: "Bordeaux", es: "Granate" },
  burgundy: { en: "Burgundy", ar: "عنابي", ru: "Бордовый", fr: "Bordeaux", es: "Burdeos" },
  titanium: { en: "Titanium", ar: "تيتانيوم", ru: "Титановый", fr: "Titane", es: "Titanio" },
  chrome: { en: "Chrome", ar: "كروم", ru: "Хром", fr: "Chromé", es: "Cromado" },
  matte: { en: "Matte", ar: "غير لامع", ru: "Матовый", fr: "Mat", es: "Mate" },
  pewter: { en: "Pewter", ar: "رصاصي", ru: "Оловянный", fr: "Étain", es: "Peltre" },
};

const loggedMisses = new Set<string>();

/**
 * Translates the recognized hue word(s) inside a colour name and leaves
 * anything else (marketing names, proper nouns) untouched, so "Uyuni White"
 * becomes "Uyuni أبيض" rather than a wrong or missing translation. English
 * is returned as-is. Logs once (deduped) when nothing in the string was
 * recognized at all, so a genuinely new colour word is visible rather than
 * silently passed through.
 */
export function translateColor(lang: CardLang, raw: string): string {
  if (!raw) return raw;
  if (lang === "en") return raw;

  const words = raw.split(/\s+/);
  let matchedAny = false;
  const translated = words.map((word) => {
    const key = word.toLowerCase().replace(/[^a-z]/g, "");
    const entry = BASE_WORDS[key];
    if (entry) {
      matchedAny = true;
      return entry[lang];
    }
    return word;
  });

  if (!matchedAny && !loggedMisses.has(raw)) {
    loggedMisses.add(raw);
    console.warn(`[colors] no recognized hue word in colour name, showing raw value: ${JSON.stringify(raw)}`);
  }

  return translated.join(" ");
}
