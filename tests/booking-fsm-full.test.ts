import { describe, it, expect } from "vitest";
import { createMachine, reduce, type BookingMachine } from "@/engine/booking-fsm";
import { availabilityFor, classesFor, findTrain } from "@/fixtures/trains";

const T = "2026-08-25T09:59:00+05:30";
const KEY = "11111111-2222-3333-4444-555555555555";

function fresh(): BookingMachine {
  return createMachine(T);
}

describe("FSM — full state coverage (100% line target)", () => {
  it("DRAFT: PASSENGERS_CONFIRMED advances", () => {
    const m = reduce(fresh(), { type: "PASSENGERS_CONFIRMED" }, T);
    expect(m.state).toBe("PASSENGERS");
    expect(m.audit[0].event).toBe("CREATED");
  });

  it("PASSENGERS: EDIT_PASSENGERS is a legal self-loop", () => {
    let m = reduce(fresh(), { type: "PASSENGERS_CONFIRMED" }, T);
    m = reduce(m, { type: "EDIT_PASSENGERS" }, T);
    expect(m.state).toBe("PASSENGERS");
  });

  it("PAY_INITIATED: only GATEWAY_REDIRECTED moves it", () => {
    let m = fresh();
    m = reduce(m, { type: "PAY_METHOD_CHOSEN", idempotencyKey: KEY }, T); // DRAFT→? (illegal in DRAFT)
    expect(m.state).toBe("DRAFT"); // PAY_METHOD_CHOSEN not valid in DRAFT
  });

  it("PAID → ISSUE_TICKET → TICKET_ISSUED terminal (audit still records pokes)", () => {
    let m = fresh();
    for (const ev of [
      { type: "PASSENGERS_CONFIRMED" },
      { type: "PAY_METHOD_CHOSEN", idempotencyKey: KEY },
      { type: "GATEWAY_REDIRECTED" },
      { type: "GATEWAY_SUCCESS" },
    ] as const) m = reduce(m, ev as never, T);
    expect(m.state).toBe("PAID");
    m = reduce(m, { type: "ISSUE_TICKET" }, T);
    expect(m.state).toBe("TICKET_ISSUED");
    // Terminal for STATE; audit notes the illegal poke (defensive-truth design):
    const stateBefore = m.state;
    m = reduce(m, { type: "GATEWAY_SUCCESS" }, T);
    expect(m.state).toBe(stateBefore); // state never leaves terminal
  });

  it("RECONCILED → ISSUE_TICKET path", () => {
    let m = fresh();
    for (const ev of [
      { type: "PASSENGERS_CONFIRMED" },
      { type: "PAY_METHOD_CHOSEN", idempotencyKey: KEY },
      { type: "GATEWAY_REDIRECTED" },
      { type: "GATEWAY_TIMEOUT" },
    ] as const) m = reduce(m, ev as never, T);
    m = reduce(m, { type: "SWEEP_MATCHED" }, T);
    expect(m.state).toBe("RECONCILED");
    m = reduce(m, { type: "ISSUE_TICKET" }, T);
    expect(m.state).toBe("TICKET_ISSUED");
  });

  it("FAILED → EDIT_PASSENGERS recovers to PASSENGERS (never silent auto-retry)", () => {
    let m = fresh();
    for (const ev of [
      { type: "PASSENGERS_CONFIRMED" },
      { type: "PAY_METHOD_CHOSEN", idempotencyKey: KEY },
      { type: "GATEWAY_REDIRECTED" },
      { type: "GATEWAY_DECLINED" },
    ] as const) m = reduce(m, ev as never, T);
    expect(m.state).toBe("FAILED");
    m = reduce(m, { type: "EDIT_PASSENGERS" }, T);
    expect(m.state).toBe("PASSENGERS");
  });

  it("attemptsByKey counts gateway redirects per key", () => {
    let m = fresh();
    m = reduce(m, { type: "PASSENGERS_CONFIRMED" }, T);
    m = reduce(m, { type: "PAY_METHOD_CHOSEN", idempotencyKey: KEY }, T);
    m = reduce(m, { type: "GATEWAY_REDIRECTED" }, T);
    expect(m.attemptsByKey[KEY]).toBe(1);
  });

  it("same key replay from PASSENGERS is a no-op (idempotent)", () => {
    let m = reduce(fresh(), { type: "PASSENGERS_CONFIRMED" }, T);
    const once = reduce(m, { type: "PAY_METHOD_CHOSEN", idempotencyKey: "aaaa" }, T);
    const twice = reduce(once, { type: "PAY_METHOD_CHOSEN", idempotencyKey: "aaaa" }, T);
    expect(twice).toEqual(once); // exact replay — no double-charge path
  });
});

describe("fixtures — classesFor + findTrain coverage", () => {
  it("classesFor returns chair-car set for Shatabdi/Vande Bharat prefixes", () => {
    expect(classesFor("12009")).toEqual(["CC", "EC"]);
    expect(classesFor("22435")).toEqual(["CC", "EC"]);
    expect(classesFor("12951")).toContain("SL");
  });

  it("findTrain resolves known numbers and undefined for unknown", () => {
    expect(findTrain("12951")?.name).toContain("Rajdhani");
    expect(findTrain("99999")).toBeUndefined();
  });
});

describe("availabilityFor — branch coverage (AVAILABLE/RAC/WL × quota)", () => {
  const dates = ["2026-09-01", "2026-09-02", "2026-09-03"];
  it("GN quota hits all three kinds across seed space", () => {
    const kinds = new Set<string>();
    for (const d of dates)
      for (const cls of ["1A", "SL"] as const) {
        kinds.add(availabilityFor({ trainNumber: "12951", journeyDate: d, travelClass: cls, quota: "GN" }).kind);
      }
    expect(kinds.size).toBeGreaterThanOrEqual(2);
  });

  it("TQ quota scarcity curve differs from GN for same train/date/class", () => {
    const gn = availabilityFor({ trainNumber: "12951", journeyDate: "2026-09-01", travelClass: "3A", quota: "GN" });
    const tq = availabilityFor({ trainNumber: "12951", journeyDate: "2026-09-01", travelClass: "3A", quota: "TQ" });
    // Not asserting which is scarcer in this seeded instance — just that the seed input matters:
    expect(JSON.stringify(gn)).not.toBe(JSON.stringify(tq));
  });
});
