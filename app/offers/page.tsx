import Link from "next/link";
import { listOffers, isExpired } from "@/lib/store";

export default function OfferHistoryPage() {
  const offers = listOffers();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-navy-text">Offer history</h1>

      {offers.length === 0 ? (
        <div className="rounded-xl border border-navy-border bg-navy-surface p-6 text-center text-sm text-navy-muted">
          No offers sent yet.{" "}
          <Link href="/offers/new" className="text-carnect-accent underline">
            Build one
          </Link>
          .
        </div>
      ) : (
        <ul className="divide-y divide-navy-border rounded-xl border border-navy-border bg-navy-surface">
          {offers.map((offer) => {
            const expired = isExpired(offer);
            return (
              <li key={offer.slug}>
                <Link
                  href={`/offer/${offer.slug}`}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-navy-text">{offer.buyer_name}</p>
                    <p className="text-xs text-navy-muted">
                      {offer.items.length} car{offer.items.length === 1 ? "" : "s"} ·{" "}
                      {new Date(offer.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-navy-muted">{offer.view_count} views</p>
                    <p className={`text-xs font-medium ${expired ? "text-red-400" : "text-emerald-400"}`}>
                      {expired ? "Expired" : `Expires ${new Date(offer.expires_at).toLocaleDateString()}`}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
