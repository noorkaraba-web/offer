"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useOfferDraft } from "@/lib/offer-draft-context";

export default function Header() {
  const { items } = useOfferDraft();
  const pathname = usePathname();

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={`text-sm font-medium ${
        pathname === href ? "text-white" : "text-white/70 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-20 bg-carnect text-white shadow">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight">
          CARNECT
        </Link>
        <nav className="flex items-center gap-5">
          {navLink("/", "Lookup")}
          {navLink("/offers", "History")}
          <Link
            href="/offers/new"
            className="relative flex items-center gap-1 rounded-full bg-carnect-accent px-3 py-1.5 text-sm font-semibold text-carnect"
          >
            Offer
            {items.length > 0 && (
              <span className="ml-1 rounded-full bg-carnect px-1.5 py-0.5 text-xs text-white">
                {items.length}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
