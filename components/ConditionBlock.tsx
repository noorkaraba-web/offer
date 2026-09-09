import { VehicleCondition } from "@/lib/types";

const GRADE_STYLES: Record<string, string> = {
  A: "bg-emerald-100 text-emerald-800",
  B: "bg-amber-100 text-amber-800",
  C: "bg-red-100 text-red-800",
};

export default function ConditionBlock({ condition }: { condition: VehicleCondition }) {
  const rows: [string, string][] = [
    ["Insurance record", condition.insurance_record],
    ["Diagnosis", condition.diagnosis],
    ["Inspection", condition.inspection],
    ["Owner changes", String(condition.owner_changes)],
  ];

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Condition</h3>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
            GRADE_STYLES[condition.grade] ?? "bg-gray-100 text-gray-800"
          }`}
        >
          Grade {condition.grade}
        </span>
      </div>
      <dl className="divide-y divide-gray-100">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between py-2 text-sm">
            <dt className="text-gray-500">{label}</dt>
            <dd className="font-medium text-gray-900">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
