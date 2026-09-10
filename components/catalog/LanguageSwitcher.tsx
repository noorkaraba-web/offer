import Link from "next/link";
import { CARD_LANGUAGES, CardLang } from "@/lib/i18n/cards";

/** Same listing across languages — each pill just swaps the [lang] segment, keeping the id. */
export default function LanguageSwitcher({ currentLang, listingId }: { currentLang: CardLang; listingId: string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {CARD_LANGUAGES.map((l) => (
        <Link
          key={l.code}
          href={`/${l.code}/catalog/${listingId}`}
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            l.code === currentLang ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {l.label}
        </Link>
      ))}
    </div>
  );
}
