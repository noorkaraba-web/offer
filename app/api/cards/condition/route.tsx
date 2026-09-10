import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { findByListingId } from "@/lib/data";
import { loadOgFonts } from "@/lib/og-fonts";
import { CARD_WIDTH, MIN_CARD_HEIGHT, COLORS, CardHeader, CardFooter, tryLoadLogo } from "@/lib/og-card-shared";
import { CardLang, dirFor, t, statusLabel } from "@/lib/i18n/cards";
import { translateTerm } from "@/lib/i18n/condition-terms";
import { SelfDiagnosisItem } from "@/lib/types";

export const runtime = "edge";

const STATUS_DOT_COLOR: Record<string, string> = {
  normal: COLORS.green,
  replaced: COLORS.red,
  welded: COLORS.amber,
  corrosion: COLORS.amber,
  unknown: COLORS.muted,
};

// GET /api/cards/condition?id=&source=&lang= — inspection report share card PNG.
// Note: this is the "Inspection report" card in the redesigned share flow
// (route path kept as /cards/condition for backwards compatibility).
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const id = searchParams.get("id");
  const source = searchParams.get("source") ?? undefined;
  const lang = (searchParams.get("lang") as CardLang) || "en";
  if (!id) return new Response("id is required", { status: 400 });

  const vehicle = await findByListingId(id, source);
  if (!vehicle) return new Response("not found", { status: 404 });

  const [fonts, logoSrc] = await Promise.all([loadOgFonts(), tryLoadLogo(origin)]);
  const rtl = dirFor(lang) === "rtl";
  const { condition } = vehicle;

  // Group self-diagnosis items in first-seen order (matches source order,
  // which already groups items together).
  const groupOrder: string[] = [];
  const byGroup = new Map<string, SelfDiagnosisItem[]>();
  for (const item of condition.selfDiagnosis) {
    if (!byGroup.has(item.group)) {
      byGroup.set(item.group, []);
      groupOrder.push(item.group);
    }
    byGroup.get(item.group)!.push(item);
  }

  const affectedPanels = condition.panels.filter((p) => p.statusCode !== "normal");
  const showStructuralSection = condition.panels.length > 0;
  const showFlags = condition.flags !== null;

  // ── Dynamic height: fixed content estimated with generous constants,
  // then this many px per self-diagnosis row/group and structural row. ──
  const HEADER_H = 200; // logo/plate + title + VIN
  const GROUP_H = 44;
  const ITEM_H = 34;
  const STRUCTURAL_H = showStructuralSection ? 60 + Math.max(affectedPanels.length, 1) * 40 : 0;
  const FLAGS_H = showFlags ? 110 : 0;
  const FOOTER_H = 60;
  const PADDING = 80;
  const contentHeight =
    HEADER_H +
    groupOrder.length * GROUP_H +
    condition.selfDiagnosis.length * ITEM_H +
    STRUCTURAL_H +
    FLAGS_H +
    FOOTER_H +
    PADDING;
  const CARD_HEIGHT = Math.max(MIN_CARD_HEIGHT, contentHeight);

  return new ImageResponse(
    (
      <div
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily: "Noto Sans, Noto Sans Arabic, Noto Sans KR",
          background: COLORS.bg,
          color: COLORS.text,
          padding: 40,
          direction: rtl ? "rtl" : "ltr",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
          <CardHeader logoSrc={logoSrc} plate={vehicle.plate} />

          <div
            style={{
              display: "flex",
              fontSize: 28,
              fontWeight: 700,
              marginTop: 18,
              textAlign: rtl ? "right" : "left",
            }}
          >
            {t(lang, "inspectionReportTitle")}
          </div>
          <div style={{ display: "flex", fontSize: 18, color: COLORS.muted, marginTop: 2 }}>{vehicle.title_en}</div>
          {vehicle.vin && (
            <div style={{ display: "flex", fontSize: 15, color: COLORS.muted, marginTop: 4 }}>
              {t(lang, "vin")} {vehicle.vin}
            </div>
          )}

          {/* ── Self-diagnosis checklist, grouped ── */}
          {groupOrder.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", marginTop: 20 }}>
              {groupOrder.map((group) => {
                const items = byGroup.get(group)!;
                const groupOk = items.every((i) => i.ok);
                return (
                  <div key={group} style={{ display: "flex", flexDirection: "column" }}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: rtl ? "row-reverse" : "row",
                        justifyContent: "space-between",
                        fontSize: 18,
                        fontWeight: 700,
                        marginTop: 10,
                        paddingBottom: 4,
                        borderBottom: `1px solid ${COLORS.border}`,
                      }}
                    >
                      <span style={{ display: "flex" }}>{translateTerm(lang, group)}</span>
                      <span style={{ display: "flex", color: groupOk ? COLORS.green : COLORS.amber }}>
                        {groupOk ? statusLabel(lang, "normal") : statusLabel(lang, "unknown")}
                      </span>
                    </div>
                    {items.map((it, i) => (
                      <div
                        key={`${it.item}-${i}`}
                        style={{
                          display: "flex",
                          flexDirection: rtl ? "row-reverse" : "row",
                          justifyContent: "space-between",
                          fontSize: 15,
                          color: COLORS.muted,
                          padding: "6px 0",
                        }}
                      >
                        <span style={{ display: "flex" }}>{translateTerm(lang, it.item)}</span>
                        <span style={{ display: "flex", color: it.ok ? COLORS.muted : COLORS.amber }}>
                          {translateTerm(lang, it.statusKo)}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Structural repairs ── */}
          {showStructuralSection && (
            <div style={{ display: "flex", flexDirection: "column", marginTop: 20 }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: rtl ? "row-reverse" : "row",
                  justifyContent: "space-between",
                  fontSize: 18,
                  fontWeight: 700,
                  paddingBottom: 4,
                  borderBottom: `1px solid ${COLORS.border}`,
                }}
              >
                <span style={{ display: "flex" }}>{t(lang, "structuralRepairsTitle")}</span>
                <span style={{ display: "flex", color: affectedPanels.length > 0 ? COLORS.red : COLORS.green }}>
                  {affectedPanels.length > 0 ? t(lang, "panelsAffected", { n: affectedPanels.length }) : t(lang, "allPanelsNormal")}
                </span>
              </div>
              {affectedPanels.length === 0 ? (
                <div style={{ display: "flex", fontSize: 15, color: COLORS.muted, padding: "8px 0" }}>
                  {t(lang, "allPanelsNormal")}
                </div>
              ) : (
                affectedPanels.map((p, i) => (
                  <div
                    key={`${p.rawName}-${i}`}
                    style={{
                      display: "flex",
                      flexDirection: rtl ? "row-reverse" : "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: 16,
                      padding: "8px 0",
                    }}
                  >
                    <span style={{ display: "flex" }}>{translateTerm(lang, p.rawName)}</span>
                    <div style={{ display: "flex", flexDirection: rtl ? "row-reverse" : "row", alignItems: "center", gap: 8 }}>
                      <span style={{ display: "flex", color: COLORS.red }}>{statusLabel(lang, p.statusCode)}</span>
                      <span
                        style={{
                          display: "flex",
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          background: STATUS_DOT_COLOR[p.statusCode] ?? COLORS.muted,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── 4-box flags footer ── */}
          {showFlags && condition.flags && (
            <div style={{ display: "flex", flexDirection: rtl ? "row-reverse" : "row", gap: 10, marginTop: 20 }}>
              {(
                [
                  [t(lang, "waterDamage"), condition.flags.waterDamage],
                  [t(lang, "modification"), condition.flags.modification],
                  [t(lang, "recall"), condition.flags.recall],
                  [t(lang, "basicStructureDamage"), condition.flags.basicStructureDamage],
                ] as [string, boolean][]
              ).map(([label, bad]) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    background: COLORS.surface2,
                    borderRadius: 8,
                    padding: "10px 12px",
                  }}
                >
                  <span style={{ display: "flex", fontSize: 13, color: COLORS.muted }}>{label}</span>
                  <span style={{ display: "flex", fontSize: 18, fontWeight: 700, color: bad ? COLORS.red : COLORS.green, marginTop: 2 }}>
                    {bad ? t(lang, "yes") : t(lang, "no")}
                  </span>
                </div>
              ))}
            </div>
          )}

          {groupOrder.length === 0 && !showStructuralSection && (
            <div style={{ display: "flex", fontSize: 18, color: COLORS.muted, marginTop: 20 }}>{t(lang, "notAvailable")}</div>
          )}
        </div>

        <CardFooter dateLabel={new Date().toLocaleDateString()} />
      </div>
    ),
    { width: CARD_WIDTH, height: CARD_HEIGHT, fonts }
  );
}
