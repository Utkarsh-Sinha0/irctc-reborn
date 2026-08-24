import { describe, it, expect } from "vitest";
import { windowFor, refundQuote, FLAT_CANCEL_Paise } from "@/engine/cancel-matrix";

describe("windowFor — April-2026 boundaries (edge D4)", () => {
  it.each([
    [72.1, "FLAT_ONLY"],
    [72, "PC_25"],
    [48, "PC_25"],
    [24.1, "PC_25"],
    [24, "PC_50"],
    [8, "PC_50"],
    [7.9, "NONE"],
  ])("%h hours → %s", (h, expected) => {
    expect(windowFor(h)).toBe(expected);
  });
});

describe("refundQuote — confirmed tickets", () => {
  const base = { totalFarePaise: 154000, travelClass: "3A" as const, passengersCount: 1, status: "CONFIRMED" as const };

  it(">72h: flat ₹180 only", () => {
    const q = refundQuote({ ...base, hoursBeforeDeparture: 96 });
    expect(q.deductionPaise).toBe(FLAT_CANCEL_Paise["3A"]);
    expect(q.refundPaise).toBe(154000 - 18000);
  });

  it("72–24h: 25% subject to flat minimum", () => {
    const q = refundQuote({ ...base, hoursBeforeDeparture: 30 });
    expect(q.deductionPaise).toBe(Math.max(Math.round(154000 * 0.25), 18000));
  });

  it("low fare: 25% below flat minimum → flat applies", () => {
    const q = refundQuote({ ...base, totalFarePaise: 40000, hoursBeforeDeparture: 30 });
    expect(q.deductionPaise).toBe(18000);
  });

  it("24–8h: 50%", () => {
    const q = refundQuote({ ...base, hoursBeforeDeparture: 10 });
    expect(q.deductionPaise).toBe(Math.max(Math.round(154000 * 0.5), 18000));
  });

  it("<8h: nothing back", () => {
    const q = refundQuote({ ...base, hoursBeforeDeparture: 6 });
    expect(q.refundPaise).toBe(0);
    expect(q.window).toBe("NONE");
  });

  it("never returns negative refund", () => {
    const q = refundQuote({ ...base, totalFarePaise: 10000, hoursBeforeDeparture: 90 });
    expect(q.refundPaise).toBeGreaterThanOrEqual(0);
  });
});

describe("refundQuote — waitlisted (₹20+GST/pax rule, flagged for reverify)", () => {
  it("≥4h: ₹20/passenger deduction only", () => {
    const q = refundQuote({
      totalFarePaise: 60000, travelClass: "SL",
      hoursBeforeDeparture: 20, passengersCount: 3, status: "WAITLISTED",
    });
    expect(q.deductionPaise).toBe(2000 * 3);
  });
  it("<4h waitlist: no refund", () => {
    const q = refundQuote({
      totalFarePaise: 60000, travelClass: "SL",
      hoursBeforeDeparture: 2, passengersCount: 1, status: "WAITLISTED",
    });
    expect(q.refundPaise).toBe(0);
  });
});

describe("family booking (Fatima ×5 chargeable + child free)", () => {
  it("child <5 does not multiply flat charges", () => {
    // 6 travellers but only 5 chargeable berths → flat uses passenger count passed by caller;
    // contract: caller passes CHARGEABLE count for confirmed math (documented in FareRules).
    const q = refundQuote({ totalFarePaise: 500000, travelClass: "2A", hoursBeforeDeparture: 80, passengersCount: 5 });
    expect(q.deductionPaise).toBe(20000 * 5);
  });
});
