/**
 * G1-WHY: /api/pay — the FSM's gateway boundary (M18/M19). Scripted timeout on
 * `pay-fail-recover` (attempt 1), idempotency-key replay guard, sweep endpoint
 * counterpart at /api/pay/sweep. Money narrative lives here, not in UI.
 * G2-BEST: single POST with intent in body; machine state persisted via signed
 * cookie so reloads resume truthfully (edge D7).
 * G3-FUTURE: blast-radius M. Pay-theater UI maps these responses 1:1 to narration.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { reduce, FSMState } from "@/engine/booking-fsm";
import type { BookingMachine } from "@/engine/booking-fsm";
import { signPayload, verifyPayload, SESSION_COOKIE } from "@/lib/session";
import { resolveScenario, jitter } from "@/lib/scenarios";

const Body = z.object({
  bookingId: z.string().uuid(),
  idempotencyKey: z.string().uuid(),
  method: z.enum(["IPAY", "UPI", "CARD", "NETBANKING"]),
});

function loadMachine(req: NextRequest, bookingId: string): BookingMachine | null {
  const raw = req.cookies.get(SESSION_COOKIE)?.value;
  const store = verifyPayload<Record<string, BookingMachine>>(raw);
  return store?.[bookingId] ?? null;
}

function saveMachine(req: NextRequest, res: NextResponse, bookingId: string, m: BookingMachine) {
  const raw = req.cookies.get(SESSION_COOKIE)?.value;
  const store = verifyPayload<Record<string, BookingMachine>>(raw) ?? {};
  store[bookingId] = m;
  res.cookies.set(SESSION_COOKIE, signPayload(store), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/",
  });
}

export async function POST(req: NextRequest) {
  const script = resolveScenario(req.nextUrl.searchParams);
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: { code: "BAD_BODY", message: "invalid payment request", retriable: false } }, { status: 400 });
  }
  await jitter(script);

  const { bookingId, idempotencyKey } = parsed.data;
  let m = loadMachine(req, bookingId);
  if (!m) {
    // First contact in this flow — synthesize through PAY_INITIATED for demo continuity.
    m = reduce(reduce(reduce(
      { state: "DRAFT", idempotencyKey: null, audit: [], attemptsByKey: {} },
      { type: "PASSENGERS_CONFIRMED" }, new Date().toISOString()),
      { type: "PAY_METHOD_CHOSEN", idempotencyKey }, new Date().toISOString()),
      { type: "GATEWAY_REDIRECTED" }, new Date().toISOString());
    if (m.state !== FSMState.enum.GATEWAY_PENDING) {
      return NextResponse.json({ ok: false, error: { code: "FSM", message: "cannot start payment", retriable: false } }, { status: 409 });
    }
  } else {
    m = reduce(m, { type: "PAY_METHOD_CHOSEN", idempotencyKey }, new Date().toISOString());
    m = reduce(m, { type: "GATEWAY_REDIRECTED" }, new Date().toISOString());
  }

  const attemptNo = m.attemptsByKey[idempotencyKey] ?? 1;
  const scriptedTimeout = script.gatewayTimeoutFirstAttempts !== undefined && attemptNo <= script.gatewayTimeoutFirstAttempts;

  let out: BookingMachine;
  let httpStatus = 200;
  if (scriptedTimeout) {
    out = reduce(m, { type: "GATEWAY_TIMEOUT" }, new Date().toISOString());
  } else if (m.state === FSMState.enum.AMBIGUOUS) {
    // retry after AMBIGUOUS → this is the sweep matching debit↔ticket (recovery beat)
    const swept = reduce(m, { type: "SWEEP_MATCHED" }, new Date().toISOString());
    out = reduce(swept, { type: "ISSUE_TICKET" }, new Date().toISOString());
  } else {
    out = reduce(m, { type: "GATEWAY_SUCCESS" }, new Date().toISOString());
    out = reduce(out, { type: "ISSUE_TICKET" }, new Date().toISOString());
  }

  const res = NextResponse.json({
    ok: true,
    serverTimeIso: new Date().toISOString(),
    data: {
      status: out.state,
      audit: out.audit,
      narrated: out.state === "AMBIGUOUS"
        ? "Bank debited ✓ · Ticket pending · Do NOT retry — reconciling now"
        : undefined,
    },
  }, { status: httpStatus });

  saveMachine(req, res, bookingId, out);
  return res;
}
