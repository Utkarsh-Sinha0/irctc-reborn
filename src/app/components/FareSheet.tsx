"use client";
/* G1-WHY: fare sheet + cancel slider (M14/M15) — the product-thinking centerpiece.
   Every ₹ visible; total==sum from engine; slider maps hours→refundQuote live (EN+हिं).
   G2-BEST: pure render of engine outputs; distance/class fixed by fixture contract;
   method fees inline (edge D3). G3-FUTURE: S. */
import { useMemo, useState } from "react";
import { computeFare, withMethodFee, METHOD_SPEED_RANK } from "@/engine/fare-rules";
import { refundQuote } from "@/engine/cancel-matrix";

const METHOD_LABEL = { IPAY: "iPay wallet · fastest · no fee", UPI: "UPI · fast", CARD: "Card", NETBANKING: "Net banking · slowest" } as const;

export default function FareSheet({
  persona, ids, idempotencyKey,
}: { persona: string; ids: string[]; idempotencyKey: string }) {
  // Fixture contract for the demo corridor: Pune→NDLS ≈ 1480 km, 3A (matches search defaults).
  const [distance] = [1480];
  const travelClass = "3A" as const;
  const quota = "TQ" as const;

  const paxCount = Math.max(ids.filter(Boolean).length, 1);
  const passengers = useMemo(
    () => Array.from({ length: paxCount }, (_, i) => ({ age: i === 0 ? 29 : 30, isChild: false })),
    [paxCount]
  );

  const base = useMemo(() => computeFare({ distanceKm: distance, travelClass, quota, passengers }), [distance, quota, passengers]);

  const [method, setMethod] = useState<(typeof METHOD_SPEED_RANK)[number]>("IPAY");
  const priced = useMemo(() => withMethodFee(base, method), [base, method]);

  // Cancel-outcome slider: hours before departure 4..120
  const [hours, setHours] = useState(72);
  const refund = useMemo(() => refundQuote({
    totalFarePaise: priced.totalPaise, travelClass, hoursBeforeDeparture: hours, passengersCount: paxCount,
    status: "CONFIRMED",
  }), [priced.totalPaise, hours, paxCount]);

  return (
    <section className="pt-6">
      <h1 className="text-2xl font-bold text-primary-dark">Your fare, in full daylight</h1>

      <ul className="mt-4 rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-surface-3">
        {priced.lines.map(l => (
          <li key={l.label} className="flex items-baseline justify-between py-1">
            <span className="opacity-80">{l.labelHi ?? l.label}</span>
            <span className="tabular-nums">₹{(l.amountPaise / 100).toFixed(2)}</span>
          </li>
        ))}
        <li className="mt-2 flex items-baseline justify-between border-t border-surface-3 pt-2 font-bold text-lg">
          <span>Total</span>
          <span className="tabular-nums text-primary-dark" data-testid="fare-total">₹{(priced.totalPaise / 100).toFixed(2)}</span>
        </li>
      </ul>

      <div className="mt-5 rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-surface-3">
        <h2 className="font-semibold">What happens if you cancel?</h2>
        <label className="mt-2 block text-base opacity-75" htmlFor="cancelslider">
          Drag to “hours before departure”: <strong className="tabular-nums">{hours}h</strong>
        </label>
        <input
          id="cancelslider" type="range" min={4} max={120} step={2} value={hours}
          onChange={e => setHours(Number(e.target.value))}
          className="mt-2 w-full accent-[var(--color-primary)]"
        />
        <div aria-live="polite" className="mt-2 rounded-xl bg-surface-3 px-4 py-3">
          <p className="text-base opacity-75">You would get back</p>
          <p className="text-3xl font-bold tabular-nums text-success" data-testid="refund-quote">
            ₹{(refund.refundPaise / 100).toFixed(2)}
          </p>
          <p className="mt-1 text-base">{refund.note}</p>
          {refund.noteHi && <p lang="hi" className="opacity-75">{refund.noteHi}</p>}
        </div>
      </div>

      <fieldset className="mt-5">
        <legend className="font-semibold">Pay with</legend>
        <div className="mt-2 grid gap-2">
          {METHOD_SPEED_RANK.map(m => (
            <label key={m} className={`flex min-h-12 cursor-pointer items-center justify-between rounded-xl px-4 ring-1 transition ${method === m ? "bg-surface-3 ring-primary" : "bg-surface ring-surface-3"}`}>
              <span>{METHOD_LABEL[m]}</span>
              <input type="radio" name="paymethod" checked={method === m} onChange={() => setMethod(m)} className="h-5 w-5 accent-[var(--color-primary)]" />
            </label>
          ))}
        </div>
      </fieldset>

      <a
        href={`/book/pay?persona=${persona}&key=${idempotencyKey}&method=${method}&ids=${ids}&scenario=${new URLSearchParams(location.search).get("scenario") ?? ""}`}
        className="mt-5 flex min-h-12 items-center justify-center rounded-xl bg-primary font-semibold text-white active:scale-[.99] transition"
      >
        Pay securely →
      </a>
    </section>
  );
}
