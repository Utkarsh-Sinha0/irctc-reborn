/**
 * G1-WHY: One-Shot availability matrix (user directive: "no choosing quota then re-searching;
 * all categories in one row, preloaded, fast"). One deterministic pass yields GN + TQ + PT
 * per class — UI renders every quota side-by-side with zero extra round-trips.
 * G2-BEST: single seeded pass per (train,class,quota) reusing availabilityFor; bands via E3.
 * Memory: O(classes × quotas) tiny objects, computed on demand, no caching layers needed.
 * G3-FUTURE: M blast-radius — /api/search shape changes; old single-quota consumers removed
 * with this commit. Production note: same fan-out hits one snapshot cache key.
 */
import { availabilityFor } from "@/fixtures/trains";
import { confirmBand } from "@/engine/wl-bands";
import type { TravelClass, Quota } from "@/lib/types";

export type QuotaKind = Quota;
export interface QuotaCell {
  quota: Quota;
  kind: "AVAILABLE" | "RAC" | "WL";
  count: number;
  confirmBandPct: number;
  worstCase: string;
  autoRefundIfNot: boolean;
  /** dynamic premium multiplier for PT (fixture-realistic 1.4–2.6×) */
  premiumX?: number;
}
export interface ClassRow {
  travelClass: TravelClass;
  cells: QuotaCell[]; // [GN, TQ, PT]
}
export interface TrainAvailabilityMatrix {
  trainNumber: string;
  journeyDate: string;
  rows: ClassRow[];
}

const QUOTAS: Quota[] = ["GN", "TQ", "PT"];

export function buildMatrix(opts: {
  trainNumber: string;
  journeyDate: string;
  classes: TravelClass[];
  scenarioKey?: string;
}): TrainAvailabilityMatrix {
  const { trainNumber, journeyDate, classes, scenarioKey = "" } = opts;

  const rows: ClassRow[] = classes.map((travelClass) => ({
    travelClass,
    cells: QUOTAS.map((quota) => {
      const av = availabilityFor({ trainNumber, journeyDate, travelClass, quota, scenarioKey });
      const band = confirmBand({
        trainNumber, travelClass, quota,
        journeyDateIso: journeyDate, kind: av.kind, count: av.count,
      });
      return {
        quota,
        kind: av.kind,
        count: av.count,
        confirmBandPct: band.pct,
        worstCase: band.worstCase,
        autoRefundIfNot: band.autoRefundIfNot,
        ...(quota === "PT" ? { premiumX: 1.4 + Math.round(((av.count % 13) / 13) * 12) / 10 } : {}),
      };
    }),
  }));

  return { trainNumber, journeyDate, rows };
}

/** Distance map lives here so fare quoting uses the SAME source as search (F3 fix lineage). */
export const CORRIDOR_KM: Record<string, number> = {
  "PUNE>NDLS": 1480, "BCT>NDLS": 1384, "NDLS>BCT": 1384, "BCT>ADI": 493,
  "NDLS>AY": 680, "CSMT>NDLS": 1541, "PNBE>NDLS": 1000, "PUNE>ADI": 1000,
};
