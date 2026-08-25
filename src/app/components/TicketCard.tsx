/* G1-WHY: 3D physical ticket — the Peak-End artifact. CSS perspective flip on mount,
 * punched holes via radial-gradient, perforation, guilloche-ish security band.
 * Reduced-motion: appears without rotation (global media query handles it).
 * G2-BEST: pure CSS 3D (no WebGL payload); deterministic data via props.
 * G3-FUTURE: S — swap content for real PNR data at integration. */
"use client";

import { LazyMotion, domAnimation, m } from "motion/react";
import ReadAloudPNR from "@/app/components/ReadAloudPNR";
import { hashSeed } from "@/lib/rng";
import { useMemo } from "react";

function pnrFromKey(key: string): string {
  const n = hashSeed(key) % 100000000000; // ≤11 digits
  return String(n).padStart(10, "0");
}

const BURST = Array.from({ length: 10 }, (_, i) => i);
const ANGLES = [0, 36, 72, 108, 144, 180, 216, 252, 288, 324];

export default function TicketCelebration({ idempotencyKey, ids, scenario = "clean" }: { idempotencyKey: string; ids: string[]; scenario?: string }) {
  const pnr = useMemo(() => pnrFromKey(idempotencyKey), [idempotencyKey]);
  const count = Math.max(ids.length, 1);

  const ics = useMemo(() => {
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT",
      `SUMMARY:Train journey (demo PNR ${pnr})`,
      `DESCRIPTION:IRCTC Reborn demo ticket · ${count} passenger(s)`,
      "DTSTART;VALUE=DATE:20260915", "DTEND;VALUE=DATE:20260916",
      "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
  }, [pnr, count]);

  return (
    <LazyMotion features={domAnimation} strict>
      <section className="mx-auto max-w-[720px] pt-2 [perspective:1200px]">
        {/* burst */}
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-24 -z-0">
          {BURST.map(i => (
            <m.span key={i}
              className="absolute block h-2 w-2 rounded-sm bg-accent"
              style={{ left: 0, top: 0 }}
              initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
              animate={{ x: Math.cos((ANGLES[i] * Math.PI) / 180) * 130, y: Math.sin((ANGLES[i] * Math.PI) / 180) * 90, opacity: 0, rotate: 180 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.25 }}
            />
          ))}
        </div>

        <m.div
          role="status"
          initial={{ rotateX: -78, y: 42, opacity: 0 }}
          animate={{ rotateX: 0, y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.18 }}
          className="relative z-10 mt-6 overflow-hidden rounded-2xl bg-surface shadow-[0_24px_60px_-18px_rgba(11,46,111,.45)] ring-1 ring-black/10"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* header band */}
          <div className="flex items-center justify-between bg-primary-dark px-5 py-2.5 text-white">
            <span className="text-sm font-bold tracking-wide">E-TICKET · IRCTC REBORN (DEMO)</span>
            <span className="rounded bg-success/90 px-2 py-0.5 text-xs font-bold">✓ CONFIRMED</span>
          </div>

          {/* PNR block */}
          <div className="border-b border-dashed border-black/20 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-widest opacity-55">PNR</p>
            <p className="font-mono text-4xl font-bold tabular-nums tracking-[0.12em]">
              {pnr.slice(0, 5)}<span className="opacity-40">·</span>{pnr.slice(5)}
            </p>
            <div className="mt-2"><ReadAloudPNR pnr={pnr} /></div>
          </div>

          {/* journey facts */}
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 px-5 py-4 sm:grid-cols-4">
            {[
              ["Train", "12290 Duronto"], ["Date", "Tue 15 Sep"],
              ["Board", "PUNE 08:10"], ["Class", "3A · TQ"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs uppercase tracking-wider opacity-50">{k}</dt>
                <dd className="mt-0.5 font-semibold tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>

          {/* passengers */}
          <div className="border-t border-surface-3 bg-surface-2/60 px-5 py-3">
            <table className="w-full text-left text-sm">
              <thead><tr className="text-xs uppercase tracking-wide opacity-50">
                <th className="py-1 pr-4 font-medium">Passenger</th><th className="px-4 py-1 font-medium">Coach/Berth</th><th className="py-1 font-medium">Status</th>
              </tr></thead>
              <tbody>
                {Array.from({ length: count }).map((_, i) => (
                  <tr key={i} className="border-t border-surface-3/70">
                    <td className="py-1.5 pr-4 font-medium">Passenger {i + 1}</td>
                    <td className="px-4 py-1.5 tabular-nums">S{i + 1}/{[12, 13, 64, 65][i % 4]} {[("LB"), ("MB"), ("UB"), ("SL")[0]][i % 4]}</td>
                    <td className="py-1.5"><span className="rounded bg-success/10 px-1.5 py-0.5 text-xs font-bold text-success">CNF</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* perforation + stub */}
          <div aria-hidden className="relative h-[2px] w-full"
            style={{ background: "radial-gradient(circle at 8px 1px, transparent 5px, var(--color-surface) 5.5px)", backgroundSize: "16px 2px" }} />
          <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-2/50 px-5 py-3">
            <p className="text-xs opacity-60">Synthetic ticket · nothing real was charged · ID: any govt photo ID</p>
            <div className="flex gap-2">
              <a href={icsHref(ics)} download={`ticket-${pnr}.ics`}
                className="flex min-h-10 items-center rounded-lg bg-primary px-3 text-sm font-semibold text-white hover:brightness-110">
                📅 Calendar
              </a>
              <a href={`/journey?pnr=${pnr}&scenario=${scenario}`}
                className="flex min-h-10 items-center rounded-lg bg-surface-3 px-3 text-sm font-semibold text-primary-dark hover:bg-surface-3/70">
                Journey →
              </a>
            </div>
          </div>

          {/* security strip */}
          <div aria-hidden className="h-2 w-full"
            style={{ background: "repeating-linear-gradient(-45deg,#0B2E6F 0 10px,#1359D1 10px 20px,#F26522 20px 30px)" }} />
        </m.div>

        {/* sr summary */}
        <p className="sr-only">Ticket confirmed. P N R {pnr.split("").join(" ")}. {count} passenger(s).</p>
      </section>
    </LazyMotion>
  );
}

function icsHref(data: string): string {
  return data;
}
