/**
 * G1-WHY: E3 WLBands — M10's "92% likely" chips. Grounded in dossier-H: CRIS has shown
 * ML confirmation probability inside IRCTC since 2018 (PIB) and IEEE ICACCTech 2024
 * reports LightGBM at 96.67% — our deterministic mock mirrors real production behavior,
 * labeled mock-historical on /how-it-works (Honesty).
 * G2-BEST: transparent banding over seeded per-train historical charts; monotonicity
 * property test proves bands never decrease as WL improves. Rejected: fake "ML" theater.
 * G3-FUTURE: blast-radius S→M (results + watcher). Band edges are copy-bearing —
 * changing thresholds requires i18n updates too.
 */
import { mulberry32, hashSeed } from "@/lib/rng";

export interface BandResult {
  pct: number;            // 0–100 confirmation likelihood
  worstCase: string;
  autoRefundIfNot: boolean;
  /** plain-language stakes line (EN) — hi variant rendered by UI dictionary */
  noteKey: "high" | "medium" | "low" | "rac";
}

/**
 * Deterministic pseudo-history → band. `wlNumber` is position in queue; deeper WL or
 * smaller pools reduce probability. RAC always shows as its own high-likelihood band.
 */
export function confirmBand(opts: {
  trainNumber: string;
  travelClass: string;
  quota: string;
  journeyDateIso: string;
  kind: "AVAILABLE" | "RAC" | "WL";
  count: number;
}): BandResult {
  const { trainNumber, travelClass, quota, journeyDateIso, kind, count } = opts;

  if (kind === "AVAILABLE") {
    return { pct: 100, worstCase: "Confirmed berth", autoRefundIfNot: false, noteKey: "high" };
  }

  const rng = mulberry32(hashSeed(`${trainNumber}:${travelClass}:${quota}:${journeyDateIso}`));
  // Pool depth: how many cancellations history says this train/class sees before chart.
  const pool = 18 + Math.floor(rng() * 40); // 18–57 typical movement

  if (kind === "RAC") {
    const pct = 88 + Math.floor(rng() * 10); // 88–97
    return { pct, worstCase: "Shared berth (RAC)", autoRefundIfNot: true, noteKey: "rac" };
  }

  // WL: ratio of movement pool to queue depth drives the band.
  const ratio = pool / Math.max(count, 1);
  let pct: number;
  let noteKey: BandResult["noteKey"];
  if (ratio >= 1.6)      { pct = 78 + Math.floor(rng() * 16); noteKey = "high"; }   // 78–93
  else if (ratio >= 0.9) { pct = 48 + Math.floor(rng() * 26); noteKey = "medium"; } // 48–73
  else                   { pct = 6 + Math.floor(rng() * 30);  noteKey = "low"; }    // 6–35

  return {
    pct,
    worstCase: count > 0 ? `WL ${count} at chart` : "Waitlisted at chart",
    autoRefundIfNot: true,
    noteKey,
  };
}

/** Watcher recompute helper: band must never DECREASE as count improves (property-tested). */
export function bandMonotonic(prevPct: number, nextPct: number): boolean {
  return nextPct >= prevPct;
}
