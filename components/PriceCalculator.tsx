"use client";

import { useEffect, useState } from "react";
import { Vehicle } from "@/lib/types";
import { useOfferDraft } from "@/lib/offer-draft-context";
import {
  DealInputs,
  DealCurrency,
  VatType,
  computeDeal,
  fmtKRW,
  fmtFX,
} from "@/lib/deal-calculator";

/**
 * Port of the standalone "Deal Calculator" tool (index.html) into the
 * vehicle detail page. The collapsible show/hide chrome around optional
 * fields was NOT ported (cosmetic only) — every input and the full
 * calculation chain were. Also not ported: the PDF/photo export buttons
 * (html2canvas/jsPDF, not available in this app) and the save/load-deal
 * list (backed by `window.storage`, a feature of the standalone tool's
 * runtime that doesn't exist here). See README for the full list.
 */

type BuyerLang = "en" | "ar";
type View = "internal" | "buyer";

// Blank string is this form's "field left empty" sentinel, matching the
// source tool's `value === ''` checks — kept distinct from 0 on purpose.
type OptNum = number | "";

interface FormState {
  dealerDc: OptNum;
  auctionFees: OptNum;
  vatType: VatType;
  vatSharePct: number;
  incentivesPct: OptNum;
  fee: OptNum;
  carrier: OptNum;
  shipping: OptNum;
  shoring: OptNum;
  handling: OptNum;
  handlingLabel: string;
  parts: OptNum;
  customFee: OptNum;
  customFeeLabel: string;
  currency: DealCurrency;
  rate: OptNum;
}

const DEFAULT_FORM: FormState = {
  dealerDc: "",
  auctionFees: "",
  vatType: "invoice",
  vatSharePct: 50,
  incentivesPct: "",
  fee: "",
  carrier: "",
  shipping: "",
  shoring: "",
  handling: "",
  handlingLabel: "",
  parts: "",
  customFee: "",
  customFeeLabel: "",
  currency: "USD",
  rate: "",
};

export default function PriceCalculator({
  vehicle,
  onResultChange,
}: {
  vehicle: Vehicle;
  onResultChange?: (totalKrw: number) => void;
}) {
  const [carPrice, setCarPrice] = useState(vehicle.price_krw);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [view, setView] = useState<View>("internal");
  const [buyerLang, setBuyerLang] = useState<BuyerLang>("en");
  const [rateStatus, setRateStatus] = useState("");

  const { addItem, updateItem, removeItem, hasItem } = useOfferDraft();
  const added = hasItem(vehicle.listing_id);

  const inputs: DealInputs = {
    carPrice,
    dealerDc: form.dealerDc === "" ? 0 : form.dealerDc,
    auctionFees: form.auctionFees === "" ? null : form.auctionFees,
    vatType: form.vatType,
    vatSharePct: form.vatSharePct,
    incentivesPct: form.incentivesPct === "" ? null : form.incentivesPct,
    fee: form.fee === "" ? null : form.fee,
    carrier: form.carrier === "" ? null : form.carrier,
    shipping: form.shipping === "" ? null : form.shipping,
    shoring: form.shoring === "" ? null : form.shoring,
    handling: form.handling === "" ? null : form.handling,
    handlingLabel: form.handlingLabel.trim() || "Handling charges",
    parts: form.parts === "" ? null : form.parts,
    customFee: form.customFee === "" ? null : form.customFee,
    customFeeLabel: form.customFeeLabel.trim() || "Customize Fees",
    currency: form.currency,
    rate: form.rate === "" ? 0 : form.rate,
  };
  const result = computeDeal(inputs);
  const conv = (krw: number) => (inputs.rate > 0 ? krw / inputs.rate : 0);

  useEffect(() => {
    onResultChange?.(result.totalKRW);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result.totalKRW]);

  async function fetchRate() {
    setRateStatus("fetching...");
    try {
      const res = await fetch("/api/fx?base=KRW");
      const data = await res.json();
      const perUnitKrw = data?.rates?.[form.currency];
      if (perUnitKrw) {
        // Mid-market rate, minus a rough 20 KRW approximation of a bank's
        // transfer-received rate — same heuristic as the standalone tool.
        const adjusted = Math.round(1 / perUnitKrw) - 20;
        set("rate", adjusted);
        setRateStatus("updated (mid-market −20) ✓");
      } else {
        setRateStatus("currency not found — enter manually");
      }
    } catch {
      setRateStatus("fetch blocked — enter manually");
    }
    setTimeout(() => setRateStatus(""), 5000);
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toOfferItem() {
    return {
      listing_id: vehicle.listing_id,
      source: vehicle.source,
      title_en: vehicle.title_en,
      price_krw: result.totalKRW,
      auction_fee_krw: 0,
      carnect_fee_krw: 0,
      inland_krw: 0,
      freight_usd: 0,
      show_breakdown: false,
    };
  }

  const isAR = view === "buyer" && buyerLang === "ar";
  const shareText = buildShareWhatsAppText(vehicle, inputs, result, conv, buyerLang);
  const waHref = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="rounded-xl border border-navy-border bg-navy-surface p-4">
      <h3 className="text-sm font-semibold text-navy-text">Deal calculator</h3>
      <p className="mt-1 text-xs text-navy-muted">
        Car price, plate and car name are filled in from the listing. Every other field feeds the
        FOB/CFR total below, which also drives the WhatsApp share cards.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* ── Input form ── */}
        <div className="space-y-3">
          <div className="rounded-lg bg-navy-surface2 p-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <ReadOnlyField label="Car name" value={vehicle.title_en} />
              <ReadOnlyField label="Plate" value={vehicle.plate || "—"} />
            </div>
            {vehicle.vin && <ReadOnlyField label="VIN (internal only)" value={vehicle.vin} className="mt-2" />}
          </div>

          <NumberField label="Car price (KRW)" value={carPrice} onChange={setCarPrice} />
          <NumberField
            label="Auction fees (KRW)"
            placeholder="leave empty to hide"
            value={form.auctionFees}
            onChange={(v) => set("auctionFees", v)}
          />
          <NumberField
            label="Dealer discount (KRW)"
            placeholder="0"
            value={form.dealerDc}
            onChange={(v) => set("dealerDc", v)}
          />
          <CalcLine label="Discounted price (after dealer dc)" value={fmtKRW(result.discounted)} />

          <div>
            <label className="mt-3 block text-xs uppercase tracking-wide text-navy-muted">VAT / tax type</label>
            <div className="mt-1 flex flex-col gap-1.5">
              <VatOption
                label="Tax invoice"
                tag="÷ 11"
                checked={form.vatType === "invoice"}
                onSelect={() => set("vatType", "invoice")}
              />
              <VatOption
                label="Individual"
                tag="× 0.07"
                checked={form.vatType === "individual"}
                onSelect={() => set("vatType", "individual")}
              />
              <VatOption
                label="No tax"
                tag="0"
                checked={form.vatType === "notax"}
                onSelect={() => set("vatType", "notax")}
              />
            </div>
          </div>
          <CalcLine label="VAT amount" value={fmtKRW(result.vatAmount)} />

          <div>
            <label className="mt-3 block text-xs uppercase tracking-wide text-navy-muted">
              Buyer&rsquo;s share of VAT (→ Karaba dc)
            </label>
            <select
              value={form.vatSharePct}
              onChange={(e) => set("vatSharePct", Number(e.target.value))}
              className="mt-1 w-full rounded-md border border-navy-border bg-navy-surface2 px-2 py-1.5 text-sm text-navy-text"
            >
              {[0, 10, 20, 30, 40, 50, 60].map((pct) => (
                <option key={pct} value={pct}>
                  {pct}% (× {(pct / 100).toFixed(2)}){pct === 0 ? " — No discount" : ""}
                </option>
              ))}
            </select>
          </div>
          <CalcLine label="Karaba dc" value={fmtKRW(result.half)} />
          <CalcLine label="Vehicle offer price" value={fmtKRW(result.offerPrice)} />

          <NumberField
            label="Incentives % (internal only)"
            placeholder="e.g. 20"
            value={form.incentivesPct}
            onChange={(v) => set("incentivesPct", v)}
          />

          <div className="grid grid-cols-2 gap-2">
            <NumberField
              label="Dealer fee (KRW)"
              placeholder="leave empty to hide"
              value={form.fee}
              onChange={(v) => set("fee", v)}
            />
            <NumberField
              label="Car carrier (KRW)"
              placeholder="leave empty to hide"
              value={form.carrier}
              onChange={(v) => set("carrier", v)}
            />
          </div>

          <div>
            <input
              value={form.handlingLabel}
              onChange={(e) => set("handlingLabel", e.target.value)}
              placeholder="Custom name (optional, default: Handling charges)"
              className="mb-1.5 w-full rounded-md border border-navy-border bg-navy-surface2 px-2 py-1.5 text-xs text-navy-text"
            />
            <NumberField
              label="Handling charges (KRW)"
              placeholder="leave empty to hide"
              value={form.handling}
              onChange={(v) => set("handling", v)}
            />
          </div>

          <NumberField
            label="Parts (KRW)"
            placeholder="leave empty to hide"
            value={form.parts}
            onChange={(v) => set("parts", v)}
          />

          <div>
            <input
              value={form.customFeeLabel}
              onChange={(e) => set("customFeeLabel", e.target.value)}
              placeholder="Custom name (optional, default: Customize Fees)"
              className="mb-1.5 w-full rounded-md border border-navy-border bg-navy-surface2 px-2 py-1.5 text-xs text-navy-text"
            />
            <NumberField
              label="Customize Fees (KRW)"
              placeholder="leave empty to hide"
              value={form.customFee}
              onChange={(v) => set("customFee", v)}
            />
          </div>

          <NumberField
            label="Shipping cost (KRW) — empty = FOB"
            placeholder="empty = FOB"
            value={form.shipping}
            onChange={(v) => set("shipping", v)}
          />
          <NumberField
            label="Shoring (KRW)"
            placeholder="leave empty to hide"
            value={form.shoring}
            onChange={(v) => set("shoring", v)}
          />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs uppercase tracking-wide text-navy-muted">Currency</label>
              <select
                value={form.currency}
                onChange={(e) => set("currency", e.target.value as DealCurrency)}
                className="mt-1 w-full rounded-md border border-navy-border bg-navy-surface2 px-2 py-1.5 text-sm text-navy-text"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
            <NumberField
              label="KRW per 1 unit"
              placeholder="1350"
              value={form.rate}
              onChange={(v) => set("rate", v)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchRate} className="text-xs font-medium text-carnect-accent underline">
              Try fetch live rate
            </button>
            {rateStatus && <span className="text-xs text-navy-muted">{rateStatus}</span>}
          </div>

          <button
            onClick={() => (added ? updateItem(vehicle.listing_id, toOfferItem()) : addItem(toOfferItem()))}
            className="mt-2 w-full rounded-lg bg-carnect py-2.5 text-sm font-semibold text-white"
          >
            {added ? "Update in offer" : "Add to offer"}
          </button>
          {added && (
            <button
              onClick={() => removeItem(vehicle.listing_id)}
              className="w-full rounded-lg border border-navy-border py-2 text-sm text-navy-muted"
            >
              Remove from offer
            </button>
          )}
        </div>

        {/* ── Quote preview ── */}
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex rounded-full border border-navy-border bg-navy-surface2 p-0.5">
                <button
                  onClick={() => setView("internal")}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    view === "internal" ? "bg-red-500 text-white" : "text-navy-muted"
                  }`}
                >
                  Internal
                </button>
                <button
                  onClick={() => setView("buyer")}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    view === "buyer" ? "bg-emerald-500 text-black" : "text-navy-muted"
                  }`}
                >
                  Buyer
                </button>
              </div>
              {view === "buyer" && (
                <div className="flex rounded-full border border-navy-border bg-navy-surface2 p-0.5">
                  <button
                    onClick={() => setBuyerLang("en")}
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      buyerLang === "en" ? "bg-amber-400 text-navy-bg" : "text-navy-muted"
                    }`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setBuyerLang("ar")}
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      buyerLang === "ar" ? "bg-amber-400 text-navy-bg" : "text-navy-muted"
                    }`}
                  >
                    AR
                  </button>
                </div>
              )}
            </div>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white"
            >
              Share text via WhatsApp
            </a>
          </div>

          <QuotePreview vehicle={vehicle} inputs={inputs} result={result} conv={conv} view={view} isAR={isAR} />
        </div>
      </div>
    </div>
  );
}

function buildShareWhatsAppText(
  vehicle: Vehicle,
  inputs: DealInputs,
  result: ReturnType<typeof computeDeal>,
  conv: (krw: number) => number,
  buyerLang: BuyerLang
): string {
  const carName = vehicle.title_en || "Vehicle";
  const plate = vehicle.plate || "";
  const waAR = buyerLang === "ar";
  const today = new Date().toLocaleDateString(waAR ? "ar-EG" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const lines: string[] = [];
  lines.push(`*${carName}*`);
  if (plate) lines.push(`Plate: ${plate}`);
  lines.push(`Quote date: ${today}`);
  lines.push("");
  lines.push(
    `${waAR ? "سعر المركبة" : "Vehicle price"}: ${fmtKRW(result.offerPrice)}  (${fmtFX(
      conv(result.offerPrice),
      inputs.currency
    )})`
  );
  if (inputs.fee !== null)
    lines.push(`${waAR ? "رسوم الوكيل" : "Dealer Fee"}: ${fmtKRW(inputs.fee)}  (${fmtFX(conv(inputs.fee), inputs.currency)})`);
  if (inputs.carrier !== null)
    lines.push(
      `${waAR ? "رسوم نقل السيارة" : "Car carrier"}: ${fmtKRW(inputs.carrier)}  (${fmtFX(conv(inputs.carrier), inputs.currency)})`
    );
  if (result.isCIF)
    lines.push(
      `${waAR ? "رسوم الشحن" : "Shipping cost"}: ${fmtKRW(inputs.shipping!)}  (${fmtFX(conv(inputs.shipping!), inputs.currency)})`
    );
  if (inputs.handling !== null)
    lines.push(`${inputs.handlingLabel}: ${fmtKRW(inputs.handling)}  (${fmtFX(conv(inputs.handling), inputs.currency)})`);
  if (inputs.parts !== null)
    lines.push(`${waAR ? "قطع الغيار" : "Parts"}: ${fmtKRW(inputs.parts)}  (${fmtFX(conv(inputs.parts), inputs.currency)})`);
  if (inputs.customFee !== null)
    lines.push(`${inputs.customFeeLabel}: ${fmtKRW(inputs.customFee)}  (${fmtFX(conv(inputs.customFee), inputs.currency)})`);
  lines.push("");
  lines.push(
    `*${waAR ? "الإجمالي" : "TOTAL / " + (result.isCIF ? "CFR" : "FOB")}: ${fmtKRW(result.totalKRW)}  (${fmtFX(
      result.fob,
      inputs.currency
    )})*`
  );
  if (inputs.rate > 0) {
    lines.push("");
    lines.push(`(1 ${inputs.currency} = ${fmtKRW(inputs.rate)})`);
  }
  return lines.join("\n");
}

function QuotePreview({
  vehicle,
  inputs,
  result,
  conv,
  view,
  isAR,
}: {
  vehicle: Vehicle;
  inputs: DealInputs;
  result: ReturnType<typeof computeDeal>;
  conv: (krw: number) => number;
  view: View;
  isAR: boolean;
}) {
  const isBuyer = view === "buyer";
  const dir = isAR ? "rtl" : "ltr";
  const today = new Date().toLocaleDateString(isAR ? "ar-EG" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const showVin = !isBuyer && vehicle.vin;
  const showRate = inputs.rate > 0;
  const lbl = {
    vin: isAR ? "رقم الهيكل" : "VIN",
    plate: isAR ? "اللوحة" : "Plate",
    date: isAR ? "التاريخ" : "Date",
    rate: isAR ? "سعر الصرف" : "Exchange rate",
  };

  type RowKind = "section" | "sub" | "muted" | "total" | "normal";
  interface Row {
    kind: RowKind;
    label: string;
    krw?: number;
    fx?: number;
  }
  const rows: Row[] = [];

  if (!isBuyer) {
    rows.push({ kind: "section", label: "Vehicle Cost" });
    rows.push({ kind: "normal", label: "Car price", krw: inputs.carPrice, fx: conv(inputs.carPrice) });
    if (inputs.auctionFees !== null && inputs.auctionFees > 0)
      rows.push({ kind: "normal", label: "Auction fees", krw: inputs.auctionFees, fx: conv(inputs.auctionFees) });
    if (inputs.dealerDc > 0)
      rows.push({ kind: "normal", label: "Dealer discount", krw: inputs.dealerDc, fx: conv(inputs.dealerDc) });
    rows.push({ kind: "sub", label: "= Car price", krw: result.vatBase, fx: conv(result.vatBase) });

    if (inputs.vatSharePct > 0) {
      const vatSecLabel =
        inputs.vatType === "invoice"
          ? "VAT (Tax invoice ÷11)"
          : inputs.vatType === "individual"
          ? "VAT (Individual ×0.07)"
          : "VAT (No tax)";
      rows.push({ kind: "section", label: vatSecLabel });
      rows.push({ kind: "muted", label: "VAT Amount", krw: result.vatAmount, fx: conv(result.vatAmount) });
      rows.push({
        kind: "normal",
        label: `Karaba DC, ${inputs.vatSharePct}%`,
        krw: result.half,
        fx: conv(result.half),
      });
      if (inputs.incentivesPct !== null) {
        rows.push({
          kind: "muted",
          label: "Total VAT",
          krw: result.vatAfterKarabaDC,
          fx: conv(result.vatAfterKarabaDC),
        });
        rows.push({
          kind: "normal",
          label: `Incentives ${inputs.incentivesPct}%`,
          krw: result.incentivesAmount!,
          fx: conv(result.incentivesAmount!),
        });
      }
      rows.push({ kind: "sub", label: "= Car DC price", krw: result.offerPrice, fx: conv(result.offerPrice) });
    }

    rows.push({ kind: "section", label: "Fees" });
    if (inputs.fee !== null) rows.push({ kind: "normal", label: "Dealer fee", krw: inputs.fee, fx: conv(inputs.fee) });
    if (inputs.carrier !== null)
      rows.push({ kind: "normal", label: "Car carrier", krw: inputs.carrier, fx: conv(inputs.carrier) });
    if (inputs.handling !== null)
      rows.push({ kind: "normal", label: inputs.handlingLabel, krw: inputs.handling, fx: conv(inputs.handling) });
    if (inputs.parts !== null) rows.push({ kind: "normal", label: "Parts", krw: inputs.parts, fx: conv(inputs.parts) });
    if (inputs.customFee !== null)
      rows.push({ kind: "normal", label: inputs.customFeeLabel, krw: inputs.customFee, fx: conv(inputs.customFee) });
    if (result.isCIF || inputs.shoring !== null) {
      rows.push({ kind: "section", label: "Shipping" });
      if (result.isCIF)
        rows.push({ kind: "normal", label: "Shipping cost", krw: inputs.shipping!, fx: conv(inputs.shipping!) });
      if (inputs.shoring !== null)
        rows.push({ kind: "normal", label: "Shoring", krw: inputs.shoring, fx: conv(inputs.shoring) });
    }
    rows.push({
      kind: "total",
      label: result.isCIF ? "TOTAL / CFR" : "TOTAL / FOB",
      krw: result.totalKRW,
      fx: result.fob,
    });
  } else {
    rows.push({
      kind: "normal",
      label: isAR ? "سعر المركبة" : "Vehicle price",
      krw: result.offerPrice,
      fx: conv(result.offerPrice),
    });
    if (inputs.fee !== null)
      rows.push({ kind: "normal", label: isAR ? "رسوم الوكيل" : "Dealer Fee", krw: inputs.fee, fx: conv(inputs.fee) });
    if (inputs.carrier !== null)
      rows.push({
        kind: "normal",
        label: isAR ? "رسوم نقل السيارة" : "Car carrier",
        krw: inputs.carrier,
        fx: conv(inputs.carrier),
      });
    if (result.isCIF)
      rows.push({
        kind: "normal",
        label: isAR ? "رسوم الشحن" : "Shipping cost",
        krw: inputs.shipping!,
        fx: conv(inputs.shipping!),
      });
    if (inputs.shoring !== null)
      rows.push({ kind: "normal", label: isAR ? "رسوم التثبيت" : "Shoring", krw: inputs.shoring, fx: conv(inputs.shoring) });
    if (inputs.handling !== null)
      rows.push({ kind: "normal", label: inputs.handlingLabel, krw: inputs.handling, fx: conv(inputs.handling) });
    if (inputs.parts !== null)
      rows.push({ kind: "normal", label: isAR ? "قطع الغيار" : "Parts", krw: inputs.parts, fx: conv(inputs.parts) });
    if (inputs.customFee !== null)
      rows.push({ kind: "normal", label: inputs.customFeeLabel, krw: inputs.customFee, fx: conv(inputs.customFee) });
    rows.push({
      kind: "total",
      label: isAR ? "الإجمالي" : "TOTAL / " + (result.isCIF ? "CFR" : "FOB"),
      krw: result.totalKRW,
      fx: result.fob,
    });
  }

  const badgeLabel = isBuyer ? (isAR ? "عرض السعر" : "Quote") : "Internal";

  return (
    <div dir={dir} className="rounded-xl bg-white p-6 text-[#1B1E26]">
      <div className={`flex items-start justify-between gap-4 ${isAR ? "flex-row-reverse" : ""}`}>
        <div>
          <span className="mb-2 inline-block rounded-full bg-[#FBE2E0] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[#B23B30]">
            {badgeLabel}
          </span>
          <div className="text-2xl font-bold">{vehicle.title_en}</div>
        </div>
      </div>

      <div className={`mt-3 grid grid-cols-2 gap-2 border-b border-gray-200 py-3 sm:grid-cols-4`}>
        {showVin && <MetaCol label={lbl.vin} value={vehicle.vin || "—"} />}
        <MetaCol label={lbl.plate} value={vehicle.plate || "—"} />
        <MetaCol label={lbl.date} value={today} />
        {showRate && <MetaCol label={lbl.rate} value={`1 ${inputs.currency} = ${fmtKRW(inputs.rate)}`} />}
      </div>

      <table className="mt-2 w-full text-sm">
        <thead>
          <tr className="border-b-2 border-[#1B1E26]">
            <th className={`pb-2 text-[11px] font-bold uppercase tracking-wide text-gray-400 ${isAR ? "text-right" : "text-left"}`}>
              {isAR ? "البنود" : "Line Item"}
            </th>
            <th className="pb-2 text-center text-[11px] font-bold uppercase tracking-wide text-gray-400">KRW</th>
            <th className="pb-2 text-center text-[11px] font-bold uppercase tracking-wide text-gray-400">
              {inputs.currency}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <QuoteRow key={i} row={r} currency={inputs.currency} isAR={isAR} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function QuoteRow({
  row,
  currency,
  isAR,
}: {
  row: { kind: "section" | "sub" | "muted" | "total" | "normal"; label: string; krw?: number; fx?: number };
  currency: DealCurrency;
  isAR: boolean;
}) {
  const labelAlign = isAR ? "text-right" : "text-left";
  if (row.kind === "section") {
    return (
      <tr>
        <td colSpan={3} className={`pb-1 pt-4 text-[10.5px] font-bold uppercase tracking-widest text-gray-500 ${labelAlign}`}>
          {row.label}
        </td>
      </tr>
    );
  }
  const rowBg = row.kind === "sub" ? "bg-gray-100" : row.kind === "total" ? "bg-[#800000] text-white" : "";
  const labelColor = row.kind === "muted" ? "text-gray-500" : row.kind === "total" ? "text-white" : "";
  const numColor =
    row.kind === "muted" ? "text-gray-400" : row.kind === "total" ? "text-white font-extrabold" : "text-[#6B0000] font-bold";
  const fontWeight = row.kind === "sub" || row.kind === "total" ? "font-bold" : "";
  return (
    <tr className={`${rowBg} ${row.kind !== "total" && row.kind !== "sub" ? "border-b border-gray-200" : ""}`}>
      <td className={`py-2.5 ${labelAlign} ${labelColor} ${fontWeight}`}>{row.label}</td>
      <td className={`py-2.5 text-center font-mono ${row.kind === "total" ? "text-white" : "text-gray-600"}`}>
        {fmtKRW(row.krw ?? 0)}
      </td>
      <td className={`py-2.5 text-center font-mono ${numColor}`}>{fmtFX(row.fx ?? 0, currency)}</td>
    </tr>
  );
}

function ReadOnlyField({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-[10px] uppercase tracking-wide text-navy-muted">{label}</p>
      <p className="mt-0.5 truncate text-sm text-navy-text">{value}</p>
    </div>
  );
}

function CalcLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-t border-navy-border pt-1.5 text-xs text-navy-muted">
      <span>{label}</span>
      <b className="font-mono text-navy-text">{value}</b>
    </div>
  );
}

function VatOption({
  label,
  tag,
  checked,
  onSelect,
}: {
  label: string;
  tag: string;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-2 text-sm ${
        checked ? "border-carnect-accent bg-navy-surface2" : "border-navy-border bg-navy-surface2"
      }`}
    >
      <input type="radio" checked={checked} onChange={onSelect} className="accent-carnect-accent" />
      <span className="text-navy-text">{label}</span>
      <span className="ml-auto font-mono text-xs text-navy-muted">{tag}</span>
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: number | "";
  onChange: (v: number | "") => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wide text-navy-muted">{label}</label>
      <input
        type="number"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        className="mt-1 w-full rounded-md border border-navy-border bg-navy-surface2 px-2 py-1.5 text-sm text-navy-text"
      />
    </div>
  );
}

function MetaCol({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[9px] font-bold uppercase tracking-wide text-gray-400">{label}</div>
      <div className="mt-0.5 text-[11.5px] font-semibold">{value}</div>
    </div>
  );
}
