"use client";
/* G1-WHY: ticket celebration (M20/M21) — the Peak-End beat. Flip + marigold burst ≤600ms,
   reduced-motion honored globally via CSS; PNR 5+5 huge tabular; .ics download (web-only).
   G2-BEST: deterministic PNR from idempotency key hash — same demo, same PNR. Motion
   transforms-only. G3-FUTURE: S. */
import { useMemo } from "react";
import { LazyMotion, domAnimation, m } from "motion/react";
import { hashSeed } from "@/lib/rng";
import ReadAloudPNR from "@/app/components/ReadAloudPNR";

function pnrFromKey(key: string): string {
  const n = hashSeed(key) % 100000000000; // ≤ 11 digits
  return String(n).padStart(10, "9").slice(0, 10);
}

const BURST = Array.from({ length: 10 }, (_, i) => i);
const ANGLES = [0, 36, 72, 108, 144, 180, 216, 252, 288, 324];

export default function TicketCelebration({ persona, idempotencyKey, ids, scenario = "clean" }: { persona: string; idempotencyKey: string; ids: string[]; scenario?: string }) {
  const pnr = useMemo(() => pnrFromKey(idempotencyKey), [idempotencyKey]);
  const count = Math.max(ids.length, 1);

  const icsHref = useMemo(() => {
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT",
      `SUMMARY:Train journey (demo PNR ${pnr})`,
      `DESCRIPTION:IRCTC Reborn demo ticket · ${count} passenger(s)`,
      "DTSTART;VALUE=DATE:20260915", "DTEND;VALUE=DATE:20260916",
      "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
  }, [pnr, count]);

  const [a, b] = [pnr.slice(0, 5), pnr.slice(5)];

  return (
    <LazyMotion features={domAnimation} strict>
      <section className="pt-6 text-center">
        <div className="relative mx-auto max-w-sm">
          {/* marigold burst (decorative only; aria-hidden) */}
          <div className="pointer-events-none absolute inset-x-0 -top-6 flex justify-center" aria-hidden>
            {BURST.map(i => (
              <m.span
                key={i}
                className="absolute h-2 w-2 rounded-full"
                style={{ backgroundColor: "var(--color-accent)" }}
                initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
                animate={{ opacity: [0, 1, 0], x: Math.cos((ANGLES[i] * Math.PI) / 180) * 90, y: Math.sin((ANGLES[i] * Math.PI) / 180) * 70, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            ))}
          </div>

          <m.div
            initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="rounded-2xl bg-surface p-5 shadow-md ring-1 ring-surface-3"
          >
            <p className="font-bold text-success">✅ CONFIRMED</p>
            <p className="mt-1 text-base opacity-70">PNR</p>
            <p className="text-4xl font-bold tabular-nums tracking-wider" data-testid="pnr">{a}·{b}</p>

            <ul className="mt-4 space-y-1 text-left">
              {Array.from({ length: count }, (_, i) => (
                <li key={i} className="flex justify-between rounded-lg bg-surface-3 px-3 py-2">
                  <span>Passenger {i + 1}</span>
                  <span className="tabular-nums">B{i + 1} · S4 · {["LB", "UB", "SL"][i % 3]}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 grid gap-2">
              <a href={icsHref} download={`ticket-${pnr}.ics`}
                className="flex min-h-12 items-center justify-center rounded-xl bg-primary font-semibold text-white active:scale-[.99] transition">
                📅 Add to calendar
              </a>
              <ReadAloudPNR pnr={pnr} />
              <a href={`/journey?pnr=${pnr}&scenario=${scenario}`}
                className="flex min-h-12 items-center justify-center rounded-xl bg-surface-3 font-semibold text-primary-dark">
                View journey timeline →
              </a>
            </div>
          </m.div>
        </div>

        <p aria-live="polite" className="sr-only">Ticket confirmed. PNR {pnr}. {count} passenger issued.</p>
        <p className="mt-4 text-base opacity-60">Demo PNR from synthetic data · no real reservation was made.</p>
      </section>
    </LazyMotion>
  );
}
