"use client";

import { useState } from "react";
import { CardLang } from "@/lib/i18n/cards";
import { t } from "@/lib/i18n/catalog";

export default function ShareBar({
  lang,
  url,
  shareText,
  rtl,
}: {
  lang: CardLang;
  url: string;
  shareText: string;
  rtl: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${url}`)}`;
  const telegramHref = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`;

  return (
    <div className={`flex flex-wrap gap-2 ${rtl ? "flex-row-reverse" : ""}`}>
      <button
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          } catch {
            // Clipboard API unavailable (e.g. insecure context) — silently no-op, link is still visible in the address bar.
          }
        }}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        {copied ? t(lang, "linkCopied") : t(lang, "copyLink")}
      </button>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg bg-[#25D366] px-3 py-2 text-sm font-semibold text-white"
      >
        {t(lang, "shareWhatsapp")}
      </a>
      <a
        href={telegramHref}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg bg-[#229ED9] px-3 py-2 text-sm font-semibold text-white"
      >
        {t(lang, "shareTelegram")}
      </a>
    </div>
  );
}
