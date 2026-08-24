/**
 * G1-WHY: /api/pay/sweep — the reconciliation endpoint the pay-theater's 12s recovery
 * beat calls after an AMBIGUOUS state (verifier audit-1 flagged this missing route).
 * G2-BEST: idempotent GET-by-key; reuses the same cookie-stored machine; sweep is a
 * pure SWEEP_MATCHED + ISSUE_TICKET reduction. No side effects beyond cookie update.
 * G3-FUTURE: blast-radius S. Production note: this becomes the hourly reconciler
 * consumer reading the payments outbox (documented on /how-it-works).
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { reduce } from "@/engine/booking-fsm";
import type { BookingMachine } from "@/engine/booking-fsm";
import { signPayload, verifyPayload, SESSION_COOKIE } from "@/lib/session";

const Query = z.object({ bookingId: z.string().uuid(), idempotencyKey: z.string().uuid() });

export async function GET(req: NextRequest) {
  const parsed = Query.safeParse(Object.fromEntries(req.nextUrl.searchParams.entries()));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: { code: "BAD_QUERY", message: "bookingId+idempotencyKey required", retriable: false } }, { status: 400 });
  }
  const { bookingId } = parsed.data;

  const raw = req.cookies.get(SESSION_COOKIE)?.value;
  const store = verifyPayload<Record<string, BookingMachine>>(raw);
  const m = store?.[bookingId];
  if (!m) {
    return NextResponse.json({ ok: false, error: { code: "NO_BOOKING", message: "unknown booking", retriable: false } }, { status: 404 });
  }

  // Sweep only makes sense from AMBIGUOUS; otherwise report current truth (idempotent).
  if (m.state !== "AMBIGUOUS") {
    return NextResponse.json({ ok: true, serverTimeIso: new Date().toISOString(), data: { status: m.state, audit: m.audit } });
  }

  let out = reduce(m, { type: "SWEEP_MATCHED" }, new Date().toISOString());
  out = reduce(out, { type: "ISSUE_TICKET" }, new Date().toISOString());

  const res = NextResponse.json({
    ok: true,
    serverTimeIso: new Date().toISOString(),
    data: {
      status: out.state,
      audit: out.audit,
      narrated: "Sweep matched your debit to the ticket — no money lost, nothing double-charged.",
    },
  });

  const nextStore = { ...(store as Record<string, BookingMachine>), [bookingId]: out };
  res.cookies.set(SESSION_COOKIE, signPayload(nextStore), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/",
  });
  return res;
}
