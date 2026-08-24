import { describe, it, expect } from "vitest";
import { createMachine, reduce } from "@/engine/booking-fsm";
import type { BookingMachine } from "@/engine/booking-fsm";

const T0 = "2026-08-25T09:59:30+05:30";
const tick = (i: number) => `2026-08-25T10:00:0${i}+05:30`;
const KEY = "3f2504e0-4f89-11d3-9a0c-0305e82c3301";

function toPending(): BookingMachine {
  let m = createMachine(T0);
  m = reduce(m, { type: "PASSENGERS_CONFIRMED" }, T0);
  m = reduce(m, { type: "PAY_METHOD_CHOSEN", idempotencyKey: KEY }, T0);
  m = reduce(m, { type: "GATEWAY_REDIRECTED" }, tick(1));
  return m;
}

describe("BookingFSM — happy path", () => {
  it("DRAFT → … → TICKET_ISSUED", () => {
    let m = toPending();
    expect(m.state).toBe("GATEWAY_PENDING");
    m = reduce(m, { type: "GATEWAY_SUCCESS" }, tick(2));
    m = reduce(m, { type: "ISSUE_TICKET" }, tick(3));
    expect(m.state).toBe("TICKET_ISSUED");
    expect(m.audit.length).toBeGreaterThanOrEqual(6);
  });
});

describe("Money-rule invariants (PRD §1.1)", () => {
  it("timeout after debit → AMBIGUOUS; never auto-FAILED", () => {
    let m = toPending();
    m = reduce(m, { type: "GATEWAY_TIMEOUT" }, tick(2));
    expect(m.state).toBe("AMBIGUOUS");
    // time passes… no silent transition exists:
    m = reduce(m, { type: "EDIT_PASSENGERS" }, tick(50));
    expect(m.state).toBe("AMBIGUOUS"); // illegal event ignored
    m = reduce(m, { type: "SWEEP_MATCHED" }, tick(52));
    expect(m.state).toBe("RECONCILED");
  });

  it("double-submit same idempotency key is a replay no-op (edge E4)", () => {
    let m = createMachine(T0);
    m = reduce(m, { type: "PASSENGERS_CONFIRMED" }, T0);
    m = reduce(m, { type: "PAY_METHOD_CHOSEN", idempotencyKey: KEY }, T0);
    const snapshot = m;
    m = reduce(m, { type: "PAY_METHOD_CHOSEN", idempotencyKey: KEY }, T0);
    expect(m).toEqual(snapshot);
  });

  it("different key mid-flight is ignored (no double charge path)", () => {
    const m0 = toPending();
    const m1 = reduce(m0, { type: "PAY_METHOD_CHOSEN", idempotencyKey: "other-key" }, tick(2));
    expect(m1.idempotencyKey).toBe(KEY);
    expect(m1.audit.at(-1)?.note).toContain("ignored");
  });

  it("DECLINE → PASSENGERS requires explicit user edit, never auto-retry (edge E2)", () => {
    let m = toPending();
    m = reduce(m, { type: "GATEWAY_DECLINED" }, tick(2));
    expect(m.state).toBe("FAILED");
    m = reduce(m, { type: "ISSUE_TICKET" }, tick(3)); // must be illegal
    expect(m.state).toBe("FAILED");
    m = reduce(m, { type: "EDIT_PASSENGERS" }, tick(4));
    expect(m.state).toBe("PASSENGERS");
  });

  it("ISSUE_TICKET only from PAID/RECONCILED (structural money proof)", () => {
    let m = toPending();
    m = reduce(m, { type: "ISSUE_TICKET" }, tick(2));
    expect(m.state).toBe("GATEWAY_PENDING");
  });
});
