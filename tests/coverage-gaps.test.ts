import { describe, it, expect } from "vitest";
import { mulberry32, hashSeed, pick } from "@/lib/rng";
import { confirmBand, bandMonotonic } from "@/engine/wl-bands";

describe("rng — pick() helper (lib coverage)", () => {
  it("pick returns elements from the array", () => {
    const rng = mulberry32(hashSeed("k"));
    const arr = ["a", "b", "c"] as const;
    for (let i = 0; i < 20; i++) expect(arr).toContain(pick(rng, arr));
  });
});

describe("wl-bands — RAC branch + bandMonotonic export", () => {
  it("RAC always lands in the 88–97 band with shared-berth worst case", () => {
    const r = confirmBand({ trainNumber: "12951", travelClass: "3A", quota: "GN", journeyDateIso: "2026-09-15", kind: "RAC", count: 7 });
    expect(r.pct).toBeGreaterThanOrEqual(88);
    expect(r.pct).toBeLessThanOrEqual(97);
    expect(r.worstCase).toBe("Shared berth (RAC)");
    expect(r.noteKey).toBe("rac");
    expect(r.autoRefundIfNot).toBe(true);
  });

  it("AVAILABLE carries no auto-refund semantics", () => {
    const r = confirmBand({ trainNumber: "12951", travelClass: "3A", quota: "GN", journeyDateIso: "2026-09-15", kind: "AVAILABLE", count: 12 });
    expect(r.autoRefundIfNot).toBe(false);
    expect(r.worstCase).toBe("Confirmed berth");
  });

  it("bandMonotonic reflects its contract", () => {
    expect(bandMonotonic(50, 60)).toBe(true);
    expect(bandMonotonic(60, 50)).toBe(false);
  });
});
