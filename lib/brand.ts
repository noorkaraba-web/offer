/**
 * Brand identity for generated share cards (and anywhere else it's needed).
 * The footer bar is the same across every language on purpose — a brand
 * name, a phone number, and a domain aren't things you translate.
 *
 * WHATSAPP_NUMBER is a placeholder — the real number wasn't provided yet.
 * Replace it with the actual one (E.164-ish display format is fine, e.g.
 * "+82 10 1234 5678") and every card picks it up automatically.
 */
export const BRAND_NAME = "KARABA";
export const BRAND_DOMAIN = "carnect.biz";
export const WHATSAPP_NUMBER = "+82-XX-XXXX-XXXX"; // TODO: replace with the real number

export function cardFooterText(): string {
  return `${BRAND_NAME} · WhatsApp ${WHATSAPP_NUMBER} · ${BRAND_DOMAIN}`;
}
