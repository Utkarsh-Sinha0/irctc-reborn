import { describe, it, expect } from "vitest";
import { buildMatrix } from "@/engine/availability-matrix";
import type { TravelClass } from "@/lib/types";

describe("availability matrix — one-shot fan-out (user directive feature)", () => {
  const opts = { trainNumber: "12951", journeyDate: "2026-09-15", classes: ["1A", "3A", "SL"] as TravelClass[] };

  it("returns exactly [GN,TQ,PT] cells per class — no second request ever needed", () => {
    const m = buildMatrix({ ...opts });
    expect(m.rows.length).toBe(3);
    for (const row of m.rows) {
      expect(row.cells.map(c => c.quota)).toEqual(["GN", "TQ", "PT"]);
    }
  });

  it("deterministic: same inputs → identical matrix", () => {
    expect(buildMatrix(opts)).toEqual(buildMatrix(opts));
  });

  it("bands stay in 0..100 and counts non-negative", () => {
    const m = buildMatrix(opts);
    for (const row of m.rows)
      for (const c of row.cells) {
        expect(c.confirmBandPct).toBeGreaterThanOrEqual(0);
        expect(c.confirmBandPct).toBeLessThanOrEqual(100);
        expect(c.count).toBeGreaterThanOrEqual(0);
      }
  });

  it("premium tatkal carries a premium multiplier when present", () => {
    const m = buildMatrix(opts);
    const pts = m.rows.flatMap(r => r.cells.filter(c => c.quota === "PT"));
    // PT cells exist; if any is AVAILABLE/RAC the premiumX must be set
    for (const pt of pts) {
      if (pt.kind !== "WL") expect(pt.premiumX).toBeGreaterThanOrEqual(1.4);
    }
  });
});
