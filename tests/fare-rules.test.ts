import { describe, it, expect } from "vitest";
import { computeFare, withMethodFee } from "@/engine/fare-rules";

const sum = (b: ReturnType<typeof computeFare>) => b.lines.reduce((s, l) => s + l.amountPaise, 0);

describe("FareRules — D2 invariant: total === sum(lines), always", () => {
  const pax = [{ age: 29, isChild: false }, { age: 33, isChild: false }];

  it("base computation", () => {
    const b = computeFare({ distanceKm: 840, travelClass: "3A", quota: "GN", passengers: pax });
    expect(b.totalPaise).toBe(sum(b));
  });

  it("tatkal quota adds its line, still balanced", () => {
    const b = computeFare({ distanceKm: 840, travelClass: "3A", quota: "TQ", passengers: pax });
    expect(b.lines.some(l => l.label.includes("TQ"))).toBe(true);
    expect(b.totalPaise).toBe(sum(b));
  });

  it("child <5 rides free (no seat): fare identical to single adult", () => {
    const withChild = computeFare({
      distanceKm: 500, travelClass: "SL", quota: "GN",
      passengers: [{ age: 30, isChild: false }, { age: 4, isChild: true }],
    });
    const alone = computeFare({ distanceKm: 500, travelClass: "SL", quota: "GN", passengers: [{ age: 30, isChild: false }] });
    expect(withChild.totalPaise).toBe(alone.totalPaise);
  });

  it.each(["IPAY", "UPI", "CARD", "NETBANKING"] as const)("withMethodFee(%s) keeps balance", (m) => {
    const base = computeFare({ distanceKm: 840, travelClass: "2A", quota: "GN", passengers: pax });
    const withFee = withMethodFee(base, m);
    expect(withFee.totalPaise).toBe(sum(withFee));
    expect(withFee.totalPaise - base.totalPaise).toBe(m === "IPAY" ? 0 : { UPI: 500, CARD: 1500, NETBANKING: 1000 }[m]);
  });

  it("GST line equals 5% of base exactly (integer paise, no drift)", () => {
    const b = computeFare({ distanceKm: 1384, travelClass: "2A", quota: "GN", passengers: pax });
    const gstLine = b.lines.find(l => l.label.startsWith("GST"))!;
    const baseLine = b.lines.find(l => l.label.startsWith("Base"))!;
    expect(gstLine.amountPaise).toBe(Math.round(baseLine.amountPaise * 0.05));
  });
});
