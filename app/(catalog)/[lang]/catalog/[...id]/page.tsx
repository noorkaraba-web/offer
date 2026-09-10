import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findByListingId } from "@/lib/data";
import { getFxRates, convertFromKrw } from "@/lib/fx";
import { formatMoney } from "@/lib/pricing";
import { CARD_LANGUAGES, CardLang, dirFor, t as tCard, statusLabel } from "@/lib/i18n/cards";
import { t as tCat } from "@/lib/i18n/catalog";
import { translateTerm } from "@/lib/i18n/condition-terms";
import { resolveEquipmentCategoryLabel, resolveEquipmentItemLabel } from "@/lib/i18n/equipment-fr";
import { translateColor } from "@/lib/i18n/colors";
import { formatRegDate } from "@/lib/i18n/dates";
import { SelfDiagnosisItem, Vehicle } from "@/lib/types";
import CatalogGallery from "@/components/catalog/CatalogGallery";
import ShareBar from "@/components/catalog/ShareBar";
import LanguageSwitcher from "@/components/catalog/LanguageSwitcher";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

interface PageProps {
  params: { lang: string; id: string[] };
}

async function resolveVehicle(params: PageProps["params"]): Promise<{ vehicle: Vehicle; lang: CardLang } | null> {
  if (!CARD_LANGUAGES.some((l) => l.code === params.lang)) return null;
  const listingId = (params.id ?? []).join("/");
  if (!listingId) return null;
  const vehicle = await findByListingId(listingId);
  if (!vehicle) return null;
  return { vehicle, lang: params.lang as CardLang };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = await resolveVehicle(params);
  if (!resolved) return { title: "Not found" };
  const { vehicle, lang } = resolved;

  const title = `${vehicle.title_en} ${vehicle.year}`.trim();
  const description = [
    `${vehicle.mileage_km.toLocaleString("en-US")} km`,
    vehicle.fuel,
    tCat(lang, "metaDescriptionTagline"),
  ]
    .filter(Boolean)
    .join(" · ");
  const image = vehicle.photos[0];
  const canonicalPath = `/${lang}/catalog/${vehicle.listing_id}`;

  return {
    title,
    description,
    metadataBase: SITE_URL ? new URL(SITE_URL) : undefined,
    alternates: {
      canonical: canonicalPath,
      languages: Object.fromEntries(CARD_LANGUAGES.map((l) => [l.code, `/${l.code}/catalog/${vehicle.listing_id}`])),
    },
    openGraph: {
      title,
      description,
      url: canonicalPath,
      type: "website",
      images: image ? [{ url: image, width: 1280, height: 768, alt: title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function CatalogPage({ params }: PageProps) {
  const resolved = await resolveVehicle(params);
  if (!resolved) notFound();
  const { vehicle, lang } = resolved!;
  const rtl = dirFor(lang) === "rtl";
  const row = rtl ? "flex-row-reverse" : "flex-row";
  const textAlign = rtl ? "text-right" : "text-left";

  const rates = await getFxRates().catch(() => null);
  const usdPrice = rates ? convertFromKrw(vehicle.price_krw, "USD", rates) : null;

  const canonicalPath = `/${lang}/catalog/${vehicle.listing_id}`;
  const canonicalUrl = SITE_URL ? new URL(canonicalPath, SITE_URL).toString() : canonicalPath;
  const shareText = `${vehicle.title_en} ${vehicle.year}`.trim();

  const whatsappMessage = tCat(lang, "whatsappMessageTemplate", {
    title: vehicle.title_en,
    plate: vehicle.plate ?? "—",
    url: canonicalUrl,
  });
  const whatsappCtaHref = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

  const affectedPanels = vehicle.condition.panels.filter((p) => p.statusCode !== "normal");

  const groupOrder: string[] = [];
  const byGroup = new Map<string, SelfDiagnosisItem[]>();
  for (const item of vehicle.condition.selfDiagnosis) {
    if (!byGroup.has(item.group)) {
      byGroup.set(item.group, []);
      groupOrder.push(item.group);
    }
    byGroup.get(item.group)!.push(item);
  }

  const ac = vehicle.condition.accidentCounts;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-6" dir={rtl ? "rtl" : "ltr"}>
      <div className={`flex items-center justify-between gap-3 ${row}`}>
        <span className="text-lg font-bold tracking-tight text-gray-900">CARNECT</span>
        <LanguageSwitcher currentLang={lang} listingId={vehicle.listing_id} />
      </div>

      <div className="mt-5">
        <div className={`flex flex-wrap items-center gap-2 ${row}`}>
          {vehicle.plate && (
            <span className="rounded-md bg-amber-400 px-2.5 py-1 text-sm font-bold text-amber-950">{vehicle.plate}</span>
          )}
          <h1 className={`text-xl font-bold text-gray-900 ${textAlign}`}>{vehicle.title_en}</h1>
        </div>
        <p className={`mt-1 text-sm text-gray-500 ${textAlign}`}>
          {formatRegDate(lang, vehicle.reg_date)} · {vehicle.mileage_km.toLocaleString("en-US")} km
        </p>

        <div className="mt-3">
          <ShareBar lang={lang} url={canonicalUrl} shareText={shareText} rtl={rtl} />
        </div>
      </div>

      <div className="mt-4">
        <CatalogGallery photos={vehicle.photos} alt={vehicle.title_en} rtl={rtl} />
      </div>

      {/* ── Specs ── */}
      <Section title={tCat(lang, "specsTitle")} rtl={rtl}>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <SpecCell label={tCard(lang, "regDate")} value={formatRegDate(lang, vehicle.reg_date)} rtl={rtl} />
          <SpecCell label={tCard(lang, "mileage")} value={`${vehicle.mileage_km.toLocaleString("en-US")} km`} rtl={rtl} />
          <SpecCell label={tCat(lang, "colorLabel")} value={translateColor(lang, vehicle.color)} rtl={rtl} />
          <SpecCell label={tCat(lang, "bodyLabel")} value={vehicle.body} rtl={rtl} />
          <SpecCell label={tCat(lang, "fuelLabel")} value={vehicle.fuel} rtl={rtl} />
          <SpecCell label={tCat(lang, "transmissionLabel")} value={vehicle.transmission} rtl={rtl} />
          {vehicle.engine_cc != null && (
            <SpecCell label={tCat(lang, "engineLabel")} value={`${vehicle.engine_cc.toLocaleString("en-US")} cc`} rtl={rtl} />
          )}
          {vehicle.seats != null && <SpecCell label={tCat(lang, "seatsLabel")} value={String(vehicle.seats)} rtl={rtl} />}
          {vehicle.vin && <SpecCell label={tCard(lang, "vin")} value={vehicle.vin} rtl={rtl} />}
        </dl>
      </Section>

      {/* ── Equipment ── */}
      {vehicle.equipment.length > 0 && (
        <Section title={tCat(lang, "equipmentTitle")} rtl={rtl}>
          <div className="space-y-4">
            {vehicle.equipment.map((cat) => (
              <div key={cat.category}>
                <h3 className={`text-sm font-semibold text-gray-700 ${textAlign}`}>
                  {resolveEquipmentCategoryLabel(lang, cat)}
                </h3>
                <ul className={`mt-1.5 grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2 ${textAlign}`}>
                  {cat.items.map((item) => (
                    <li key={item.key} className="flex items-center gap-1.5 text-sm text-gray-600">
                      <span className="text-emerald-600">✓</span>
                      {resolveEquipmentItemLabel(lang, item)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Condition & inspection report ── */}
      <Section title={tCat(lang, "conditionTitle")} rtl={rtl}>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SpecCell label={tCard(lang, "grade")} value={vehicle.condition.grade} rtl={rtl} />
          <SpecCell label={tCard(lang, "diagnosis")} value={vehicle.condition.diagnosis} rtl={rtl} />
          <SpecCell label={tCard(lang, "inspection")} value={vehicle.condition.inspection} rtl={rtl} />
          <SpecCell label={tCard(lang, "insuranceRecord")} value={vehicle.condition.insurance_record} rtl={rtl} />
        </dl>

        {vehicle.condition.panels.length > 0 && (
          <div className="mt-4">
            <div className={`flex items-center justify-between ${row}`}>
              <span className={`text-sm font-semibold text-gray-700 ${textAlign}`}>{tCard(lang, "structuralRepairsTitle")}</span>
              <span className={`text-sm font-semibold ${affectedPanels.length > 0 ? "text-red-600" : "text-emerald-600"}`}>
                {affectedPanels.length > 0
                  ? tCard(lang, "panelsAffected", { n: affectedPanels.length })
                  : tCard(lang, "allPanelsNormal")}
              </span>
            </div>
            {affectedPanels.length > 0 && (
              <ul className="mt-2 space-y-1.5">
                {affectedPanels.map((p, i) => (
                  <li
                    key={`${p.rawName}-${i}`}
                    className={`flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm ${row}`}
                  >
                    <span className="text-gray-800">{translateTerm(lang, p.rawName)}</span>
                    <span className="font-medium text-red-600">{statusLabel(lang, p.statusCode)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {groupOrder.length > 0 && (
          <div className="mt-4 space-y-3">
            {groupOrder.map((group) => {
              const items = byGroup.get(group)!;
              const groupOk = items.every((i) => i.ok);
              return (
                <div key={group}>
                  <div className={`flex items-center justify-between border-b border-gray-200 pb-1 ${row}`}>
                    <span className="text-sm font-semibold text-gray-700">{translateTerm(lang, group)}</span>
                    <span className={`text-xs font-medium ${groupOk ? "text-emerald-600" : "text-amber-600"}`}>
                      {groupOk ? statusLabel(lang, "normal") : statusLabel(lang, "unknown")}
                    </span>
                  </div>
                  {items.map((it, i) => (
                    <div key={`${it.item}-${i}`} className={`flex items-center justify-between py-1 text-xs ${row}`}>
                      <span className="text-gray-500">{translateTerm(lang, it.item)}</span>
                      <span className={it.ok ? "text-gray-500" : "font-medium text-amber-600"}>
                        {translateTerm(lang, it.statusKo)}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {vehicle.condition.flags && (
          <div className={`mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4`}>
            {(
              [
                [tCard(lang, "waterDamage"), vehicle.condition.flags.waterDamage],
                [tCard(lang, "modification"), vehicle.condition.flags.modification],
                [tCard(lang, "recall"), vehicle.condition.flags.recall],
                [tCard(lang, "basicStructureDamage"), vehicle.condition.flags.basicStructureDamage],
              ] as [string, boolean][]
            ).map(([label, bad]) => (
              <div key={label} className="rounded-lg bg-gray-50 p-2.5">
                <p className="text-xs text-gray-500">{label}</p>
                <p className={`mt-0.5 text-sm font-semibold ${bad ? "text-red-600" : "text-emerald-600"}`}>
                  {bad ? tCard(lang, "yes") : tCard(lang, "no")}
                </p>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ── Insurance history ── */}
      <Section title={tCat(lang, "insuranceHistoryTitle")} rtl={rtl}>
        {ac ? (
          <ul className={`space-y-1.5 text-sm text-gray-700 ${textAlign}`}>
            {ac.myAccidents === 0 && ac.otherAccidents === 0 && ac.totalLoss === 0 && ac.floodLoss === 0 && ac.theft === 0 ? (
              <li>{tCat(lang, "insuranceNoAccidents")}</li>
            ) : (
              <>
                {ac.myAccidents > 0 && <li>{tCat(lang, "insuranceMyAccidents", { n: ac.myAccidents })}</li>}
                {ac.otherAccidents > 0 && <li>{tCat(lang, "insuranceOtherAccidents", { n: ac.otherAccidents })}</li>}
                {ac.totalLoss > 0 && <li>{tCat(lang, "insuranceTotalLoss")}</li>}
                {ac.floodLoss > 0 && <li>{tCat(lang, "insuranceFloodLoss")}</li>}
                {ac.theft > 0 && <li>{tCat(lang, "insuranceTheft")}</li>}
              </>
            )}
            <li>{tCat(lang, "insuranceOwnerChanges", { n: ac.ownerChanges })}</li>
          </ul>
        ) : (
          <p className={`text-sm text-gray-500 ${textAlign}`}>{vehicle.condition.insurance_record}</p>
        )}
      </Section>

      {/* ── FOB price + WhatsApp CTA ── */}
      <div className="mt-6 rounded-xl bg-gray-900 p-5 text-white">
        <p className="text-xs uppercase tracking-wide text-gray-400">{tCat(lang, "fobPriceTitle")}</p>
        <p className="mt-1 text-3xl font-bold">₩{vehicle.price_krw.toLocaleString("en-US")}</p>
        {usdPrice !== null && <p className="mt-1 text-lg text-gray-300">{formatMoney(usdPrice, "USD")}</p>}
        <p className="mt-1 text-xs text-gray-400">{tCat(lang, "fobPriceNote")}</p>
        <a
          href={whatsappCtaHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 block rounded-lg bg-[#25D366] py-3 text-center text-sm font-semibold text-white"
        >
          {tCat(lang, "whatsappCta")}
        </a>
      </div>

      <a href={vehicle.url} target="_blank" rel="noopener noreferrer" className="mt-4 block text-center text-sm text-gray-500 underline">
        {tCat(lang, "viewOriginalListing")}
      </a>
    </div>
  );
}

function Section({ title, rtl, children }: { title: string; rtl: boolean; children: React.ReactNode }) {
  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
      <h2 className={`mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 ${rtl ? "text-right" : "text-left"}`}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function SpecCell({ label, value, rtl }: { label: string; value: string; rtl: boolean }) {
  return (
    <div className={`rounded-lg bg-gray-50 p-3 ${rtl ? "text-right" : "text-left"}`}>
      <dt className="text-xs uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-1 truncate text-sm font-medium text-gray-800">{value || "—"}</dd>
    </div>
  );
}
