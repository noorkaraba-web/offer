/**
 * Brand identity for generated share cards (and anywhere else it's needed).
 * The footer bar is the same across every language on purpose — a brand
 * name, a phone number, and a domain aren't things you translate.
 */
export const BRAND_NAME = "KARABA";
export const BRAND_DOMAIN = "carnect.biz";
export const WHATSAPP_NUMBER = "+82-10-9671-2799";

export function cardFooterText(): string {
  return `${BRAND_NAME} · WhatsApp ${WHATSAPP_NUMBER} · ${BRAND_DOMAIN}`;
}
