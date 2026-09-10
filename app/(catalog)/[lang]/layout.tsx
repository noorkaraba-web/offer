import { notFound } from "next/navigation";
import "../../globals.css";
import { CARD_LANGUAGES, CardLang, dirFor } from "@/lib/i18n/cards";

/**
 * Second root layout (Next.js "multiple root layouts" pattern — see
 * https://nextjs.org/docs/app/building-your-application/routing/route-groups#opting-specific-segments-out-of-shared-layouts).
 * The public catalog pages need a genuinely different `<html lang dir>` per
 * request (real SSR RTL for Arabic, not a client-side patch), which a single
 * shared root layout can't express since it doesn't see this segment's
 * params. The staff app's root layout lives in app/(staff)/layout.tsx.
 */

export function generateStaticParams() {
  return CARD_LANGUAGES.map((l) => ({ lang: l.code }));
}

export default function CatalogLangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  if (!CARD_LANGUAGES.some((l) => l.code === params.lang)) notFound();
  const lang = params.lang as CardLang;

  return (
    <html lang={lang} dir={dirFor(lang)}>
      <body className="min-h-screen bg-white text-gray-900 antialiased">{children}</body>
    </html>
  );
}
