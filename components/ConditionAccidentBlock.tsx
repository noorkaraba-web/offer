import { VehicleCondition, PanelStatusCode } from "@/lib/types";

const STATUS_LABEL: Record<PanelStatusCode, string> = {
  normal: "Normal",
  replaced: "Replaced",
  welded: "Welded / panel beaten",
  corrosion: "Corrosion",
  unknown: "Reported",
};

const STATUS_STYLE: Record<PanelStatusCode, string> = {
  normal: "bg-emerald-900/40 text-emerald-300",
  replaced: "bg-red-900/40 text-red-300",
  welded: "bg-amber-900/40 text-amber-300",
  corrosion: "bg-orange-900/40 text-orange-300",
  unknown: "bg-navy-surface2 text-navy-muted",
};

export default function ConditionAccidentBlock({ condition }: { condition: VehicleCondition }) {
  const affected = condition.panels.filter((p) => p.statusCode !== "normal");

  return (
    <div className="rounded-xl border border-navy-border bg-navy-surface p-4">
      <h3 className="mb-3 text-sm font-semibold text-navy-text">🔍 Condition &amp; accident history</h3>

      {affected.length > 0 && (
        <div className="mb-3 rounded-lg border border-red-800 bg-red-950/40 p-3">
          <p className="text-sm font-semibold text-red-300">⚠ Structural damage</p>
          <p className="text-xs text-red-400/80">{affected.length} panel{affected.length === 1 ? "" : "s"} affected</p>
        </div>
      )}

      {condition.panels.length > 0 && (
        <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {(affected.length > 0 ? affected : condition.panels).map((panel, i) => (
            <div
              key={`${panel.name}-${i}`}
              className="flex items-center justify-between rounded-lg bg-navy-surface2 px-3 py-2 text-sm"
            >
              <span className="text-navy-text">{panel.name}</span>
              <span
                className={`rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${STATUS_STYLE[panel.statusCode]}`}
              >
                {panel.statusCode === "unknown" ? panel.rawStatus : STATUS_LABEL[panel.statusCode]}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCell label="Grade" value={condition.grade} />
        <SummaryCell label="Insurance record" value={condition.insurance_record} />
        <SummaryCell label="Diagnosis" value={condition.diagnosis} />
        <SummaryCell label="Inspection" value={condition.inspection} />
      </div>
    </div>
  );
}

function SummaryCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-navy-surface2 p-3">
      <p className="text-xs uppercase tracking-wide text-navy-muted">{label}</p>
      <p className="mt-1 text-sm font-medium text-navy-text">{value}</p>
    </div>
  );
}
