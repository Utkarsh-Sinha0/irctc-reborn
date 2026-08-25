"use client";
/* G1-WHY: payment theater (M18/M19) — the trust moment. Narrated FSM steps; scripted
   AMBIGUOUS → 12s countdown → sweep → ticket (pay-fail-recover); Motion choreography.
   G2-BEST: single client island polling /api/pay then /api/pay/sweep; narration strings
   come from API responses — UI never invents money claims. G3-FUTURE: S. */
import { useCallback, useEffect, useRef, useState } from "react";
import { LazyMotion, domAnimation, m } from "motion/react";

type Phase =
  | { k: "idle" } | { k: "narrating"; text: string }
  | { k: "ambiguous"; text: string; secs: number }
  | { k: "done" } | { k: "error"; text: string };

export default function PayTheater({
  persona, idempotencyKey, method, ids, scenario, train, date,
}: { persona: string; idempotencyKey: string; method: string; ids: string[]; scenario: string; train?: string; date?: string }) {
  const [phase, setPhase] = useState<Phase>({ k: "idle" });
  const bookingIdRef = useRef<string>(crypto.randomUUID());

  const goTicket = useCallback(() => {
    const sp = new URLSearchParams({ persona, key: idempotencyKey, ids: ids.join(","), bookingId: bookingIdRef.current, scenario });
    if (train) sp.set("train", train);
    if (date) sp.set("date", date);
    location.assign(`/book/ticket?${sp.toString()}`);
  }, [persona, idempotencyKey, ids, train, date, scenario]);

  const pay = useCallback(async () => {
    setPhase({ k: "narrating", text: "Securing your seats…" });
    try {
      const res = await fetch(`/api/pay?scenario=${encodeURIComponent(scenario)}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ bookingId: bookingIdRef.current, idempotencyKey, method }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message ?? "payment failed");

      if (json.data.status === "AMBIGUOUS") {
        setPhase({ k: "ambiguous", text: json.data.narrated ?? "Reconciling…", secs: 12 });
      } else if (json.data.status === "TICKET_ISSUED" || json.data.status === "PAID") {
        setPhase({ k: "done" });
        setTimeout(goTicket, 900);
      } else {
        setPhase({ k: "error", text: `Unexpected state: ${json.data.status}` });
      }
    } catch {
      setPhase({ k: "error", text: "Could not reach payment. You have NOT been charged. Retry safely." });
    }
  }, [scenario, idempotencyKey, method, goTicket]);

  // AMBIGUOUS → sweep countdown (12s scripted recovery)
  useEffect(() => {
    if (phase.k !== "ambiguous") return;
    if (phase.secs <= 0) {
      (async () => {
        try {
          const res = await fetch(`/api/pay/sweep?bookingId=${bookingIdRef.current}&idempotencyKey=${idempotencyKey}`);
          const json = await res.json();
          if (json.ok && (json.data.status === "RECONCILED" || json.data.status === "TICKET_ISSUED")) {
            setPhase({ k: "done" });
            setTimeout(goTicket, 900);
          } else {
            setPhase({ k: "error", text: "Sweep could not confirm yet. Nothing is lost — support path shown on ticket page." });
          }
        } catch {
          setPhase({ k: "error", text: "Network hiccup during reconciliation. Nothing is lost." });
        }
      })();
      return;
    }
    const t = setTimeout(() => setPhase(p => (p.k === "ambiguous" ? { ...p, secs: p.secs - 1 } : p)), 1000);
    return () => clearTimeout(t);
  }, [phase, idempotencyKey, goTicket]);

  return (
    <LazyMotion features={domAnimation} strict>
      <section className="pt-6">
        <h1 className="text-2xl font-bold text-primary-dark">Payment</h1>

        <a href={`/book/fare?persona=${persona}&key=${idempotencyKey}&method=${method}&ids=${ids.join(",")}${train ? `&train=${train}` : ""}`} className="text-base text-primary underline underline-offset-2">← back to fare</a>

        <m.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="mt-4 rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-surface-3"
        >
          {phase.k === "idle" && (
            <>
              <p className="opacity-80">Method: <strong>{method}</strong> · amount frozen at quote</p>
              <button onClick={() => void pay()}
                className="mt-3 min-h-12 w-full rounded-xl bg-primary font-semibold text-white active:scale-[.99] transition">
                Pay now →
              </button>
            </>
          )}

          {phase.k === "narrating" && (
            <p aria-live="polite" className="flex items-center gap-3 py-2">
              <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-primary" aria-hidden />
              {phase.text}
            </p>
          )}

          {phase.k === "ambiguous" && (
            <div role="alert" className="rounded-xl border-2 border-error/60 bg-error/5 p-4">
              <p className="font-semibold text-error">Bank debited ✓ · Ticket pending</p>
              <p className="mt-1">{phase.text}</p>
              <p className="mt-2 tabular-nums">Reconciling in {phase.secs}s…</p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-error/10">
                <div className="h-full bg-error/70 transition-all duration-1000" style={{ width: `${(phase.secs / 12) * 100}%` }} />
              </div>
            </div>
          )}

          {phase.k === "done" && <p aria-live="polite" className="py-2 font-semibold text-success">✅ Payment verified — issuing ticket…</p>}

          {phase.k === "error" && (
            <div role="alert" className="rounded-xl border border-warn/50 bg-warn/5 p-4">
              <p>{phase.text}</p>
              <button onClick={() => void pay()} className="mt-2 min-h-12 w-full rounded-xl bg-primary font-semibold text-white">
                Retry safely
              </button>
            </div>
          )}
        </m.div>

        <p className="mt-3 text-base opacity-60">
          Note: no real money moves. The failure-and-recovery sequence is scripted so you can watch how we behave when things go wrong.
        </p>
      </section>
    </LazyMotion>
  );
}
