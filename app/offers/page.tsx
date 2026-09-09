import Link from "next/link";
import { listOffers, isExpired } from "@/lib/store";

export default function OfferHistoryPage() {
  const offers = listOffers();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Offer history</h1>

      {offers.length === 0 ? (
        <div className="rounded-xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
          No offers sent yet.{" "}
          <Link href="/offers/new" className="text-carnect underline">
            Build one
          </Link>
          .
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-xl bg-white shadow-sm">
          {offers.map((offer) => {
            const expired = isExpired(offer);
            return (
              <li key={offer.slug}>
                <Link
                  href={`/offer/${offer.slug}`}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{offer.buyer_name}</p>
                    <p className="text-xs text-gray-500">
                      {offer.items.length} car{offer.items.length === 1 ? "" : "s"} ·{" "}
                      {new Date(offer.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{offer.view_count} views</p>
                    <p className={`text-xs font-medium ${expired ? "text-red-600" : "text-emerald-600"}`}>
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
