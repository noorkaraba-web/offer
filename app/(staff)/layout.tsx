import type { Metadata } from "next";
import "../globals.css";
import { OfferDraftProvider } from "@/lib/offer-draft-context";
import { CatalogExportProvider } from "@/lib/catalog-export-context";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Carnect Lookup & Offer Builder",
  description: "Plate/listing lookup, price builder, and offer builder for Carnect staff.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-navy-bg text-navy-text">
        <OfferDraftProvider>
          <CatalogExportProvider>
            <Header />
            <main className="mx-auto max-w-4xl px-4 pb-16 pt-6">{children}</main>
          </CatalogExportProvider>
        </OfferDraftProvider>
      </body>
    </html>
  );
}
