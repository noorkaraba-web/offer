"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Vehicle } from "@/lib/types";

const RECENT_KEY = "carnect_recent_lookups_v1";

interface RecentEntry {
  listing_id: string;
  title_en: string;
  at: string;
}

type LookupState = "idle" | "loading" | "not_found";

export default function SearchScreen({
  indexCounters,
}: {
  indexCounters: { total: number; withPlate: number; encar: number; heydealer: number };
}) {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<LookupState>("idle");
  const [recent, setRecent] = useState<RecentEntry[]>([]);
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw) setRecent(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  function saveRecent(vehicle: Vehicle) {
    try {
      const next = [
        { listing_id: vehicle.listing_id, title_en: vehicle.title_en, at: new Date().toISOString() },
        ...recent.filter((r) => r.listing_id !== vehicle.listing_id),
      ].slice(0, 8);
      setRecent(next);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  async function runLookup(q: string) {
    const value = q.trim();
    if (!value) return;
    setState("loading");

    const isPlate = /[가-힣]/.test(value);
    const url = isPlate
      ? `/api/lookup?plate=${encodeURIComponent(value)}`
      : `/api/lookup?id=${encodeURIComponent(value)}`;

    const res = await fetch(url);
    if (!res.ok) {
      setState("not_found");
      return;
    }
    const vehicle: Vehicle = await res.json();
    saveRecent(vehicle);
    router.push(`/car/${vehicle.listing_id}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Lookup a car</h1>
        <p className="mt-1 text-sm text-gray-500">
          Enter a Korean plate (e.g. 12가3456) or a Carnect listing ID (e.g. 41436660).
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          runLookup(query);
        }}
        className="flex gap-2"
      >
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (state === "not_found") setState("idle");
          }}
          placeholder="Plate or listing ID"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-3 text-base"
          autoFocus
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="rounded-lg bg-carnect px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {state === "loading" ? "Looking up…" : "Look up"}
        </button>
      </form>

      {state === "not_found" && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          No car found for &ldquo;{query}&rdquo;.{" "}
          {/[가-힣]/.test(query) && (
            <>Try the listing ID instead — it&rsquo;s in the Carnect URL, e.g. /car/41436660.</>
          )}
        </div>
      )}

      <div className="grid grid-cols-4 gap-2 text-center">
        <Stat label="Mock fallback" value={indexCounters.total} />
        <Stat label="With mock plate" value={indexCounters.withPlate} />
        <Stat label="Encar (mock)" value={indexCounters.encar} />
        <Stat label="HeyDealer (mock)" value={indexCounters.heydealer} />
      </div>
      <p className="-mt-4 text-xs text-gray-400">
        Lookups try carnect.biz live first; these counts are only the local mock fallback.
      </p>

      {recent.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-gray-900">Recent lookups</h2>
          <ul className="divide-y divide-gray-100 rounded-lg bg-white shadow-sm">
            {recent.map((r) => (
              <li key={r.listing_id}>
                <button
                  onClick={() => router.push(`/car/${r.listing_id}`)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm"
                >
                  <span className="font-medium text-gray-900">{r.title_en}</span>
                  <span className="text-xs text-gray-400">{r.listing_id}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-white py-3 shadow-sm">
      <div className="text-lg font-bold text-carnect">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}
