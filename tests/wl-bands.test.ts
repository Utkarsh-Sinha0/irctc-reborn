import { describe, it, expect } from "vitest";
import { confirmBand, bandMonotonic } from "@/engine/wl-bands";
import { availabilityFor } from "@/fixtures/trains";
import { mulberry32, hashSeed } from "@/lib/rng";

const base = { trainNumber: "12951", travelClass: "3A", quota: "GN", journeyDateIso: "2026-09-15" };

describe("WLBands — determinism & sanity (edge H5)", () => {
  it("same inputs → same band forever", () => {
    const a = confirmBand({ ...base, kind: "WL", count: 23 });
    const b = confirmBand({ ...base, kind: "WL", count: 23 });
    expect(a).toEqual(b);
  });

  it("AVAILABLE is always 100", () => {
    expect(confirmBand({ ...base, kind: "AVAILABLE", count: 5 }).pct).toBe(100);
  });

  it("bands stay within 0–100", () => {
    for (let count = 1; count <= 90; count += 7) {
      const r = confirmBand({ ...base, kind: "WL", count });
      expect(r.pct).toBeGreaterThanOrEqual(0);
      expect(r.pct).toBeLessThanOrEqual(100);
    }
  });

  it("deeper waitlists never get higher bands than shallow ones on the same train/date (monotonic property)", () => {
    // For a fixed seeded pool, band(count) must be non-increasing as queue grows.
    let prev = 101;
    for (let count = 1; count <= 60; count++) {
      const r = confirmBand({ ...base, kind: "WL", count });
      if (!bandMonotonic(prev, r.pct)) {
        // allow only the documented seed-shift at pool boundaries? No — strict by design:
        expect.soft(r.pct, `count=${count}`).toBeLessThanOrEqual(prev);
      }
      prev = Math.min(prev, r.pct) === prev && prev !== 101 ? Math.min(prev, r.pct) : r.pct;
      // simpler invariant enforced below
      expect(r.pct).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("fixture determinism — CI seed-hash guard (H5)", () => {
  it("availabilityFor is stable across calls", () => {
    const a = availabilityFor({ trainNumber: "12951", journeyDate: "2026-09-15", travelClass: "3A", quota: "TQ" });
    const b = availabilityFor({ trainNumber: "12951", journeyDate: "2026-09-15", travelClass: "3A", quota: "TQ" });
    expect(a).toEqual(b);
  });

  it("scenario key changes outcomes (scenario engine contract)", () => {
    const plain = availabilityFor({ trainNumber: "12951", journeyDate: "2026-09-15", travelClass: "3A", quota: "GN" });
    const rush = availabilityFor({ trainNumber: "12951", journeyDate: "2026-09-15", travelClass: "3A", quota: "GN", scenarioKey: "tatkal-rush" });
    // Not guaranteed different for every pair, but must be for this pinned pair:
    expect(JSON.stringify([plain, rush])).not.toBe(JSON.stringify([plain, plain]));
  });

  it("rng reproducibility", () => {
    const r1 = mulberry32(hashSeed("x"));
    const r2 = mulberry32(hashSeed("x"));
    for (let i = 0; i < 10; i++) expect(r1()).toBe(r2());
  });
});
