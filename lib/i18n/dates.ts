import { CardLang } from "./cards";

/**
 * Month-name translation for `Vehicle.reg_date`. The live parser produces
 * "MM/YYYY" (confirmed against a real carnect.biz spec table: "Reg. date:
 * 12/2022"); the mock seed data predates that and uses "YYYY-MM" — both are
 * handled here. This is the direct fix for the exact bug MDM's reference
 * page has: it shows the registration date's month name in Russian even on
 * its Arabic page.
 */

const MONTHS: Record<CardLang, string[]> = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  ar: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
  ru: ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"],
  fr: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
  es: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
};

/** Parses "MM/YYYY" or "YYYY-MM" into [month 1-12, year], or null if unrecognized. */
function parseRegDate(raw: string): [number, number] | null {
  let m = raw.match(/^(\d{1,2})\/(\d{4})$/);
  if (m) return [Number(m[1]), Number(m[2])];
  m = raw.match(/^(\d{4})-(\d{1,2})$/);
  if (m) return [Number(m[2]), Number(m[1])];
  return null;
}

/** Formats reg_date as a localized "Month YYYY" string; falls back to the raw value if unparseable. */
export function formatRegDate(lang: CardLang, regDate: string | null | undefined): string {
  if (!regDate) return "";
  const parsed = parseRegDate(regDate);
  if (!parsed) return regDate;
  const [month, year] = parsed;
  if (month < 1 || month > 12) return regDate;
  const monthName = MONTHS[lang]?.[month - 1] ?? MONTHS.en[month - 1];
  return `${monthName} ${year}`;
}
