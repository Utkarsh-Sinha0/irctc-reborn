"use client";
/* G1-WHY: landing = the booking workspace itself (no marketing surface, no personas).
 * Dense IRCTC-style search strip + live one-shot matrix + evidence ticker of REAL
 * citizen complaints the fixes map to. Desktop 12-col grid; mobile stacks.
 * G2-BEST: reuses SearchForm engine wiring; complaint data is static research ground truth.
 * G3-FUTURE: S. */
import { useEffect, useState } from "react";

const COMPLAINTS: { stat: string; src: string; fix: string; href: string }[] = [
  { stat: "40% mostly FAIL at Tatkal", src: "LocalCircles survey · 55,000+ responses", fix: "One-shot matrix + pre-staged flow", href: "/book/new?quota=TQ" },
  { stat: "70% see tickets vanish in <60s", src: "Same survey", fix: "Cell-tap books exact train+class+quota — zero dead taps", href: "/book/new?quota=TQ" },
  { stat: "₹ deducted, ticket not issued", src: "Economic Times complaint coverage", fix: "FSM recovery: AMBIGUOUS → sweep → ticket", href: "/book/new?quota=TQ&scenario=pay-fail-recover" },
  { stat: "Refund status: “under process” for months", src: "Consumer forums, X threads", fix: "Cancellation slider shows exact ₹ before you pay", href: "/how-it-works" },
];

export default function Landing() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(v => (v + 1) % COMPLAINTS.length), 4200);
    return () => clearInterval(t);
  }, []);
  const c = COMPLAINTS[tick];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <section aria-label="Search trains">
        <h1 className="text-xl font-bold">Search trains</h1>
        <p className="mt-0.5 text-sm opacity-70">
          One request returns every class × every quota. Pick a cell — that exact seat category opens.
        </p>
        {/* SearchForm renders its own dense form + results table */}
        <SearchSlot />
      </section>

      <aside className="grid content-start gap-4">
        <div className="rounded-xl border border-surface-3 bg-surface p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-warn">Real problem we fixed</p>
          <p className="mt-2 text-lg font-semibold leading-snug">{c.stat}</p>
          <p className="mt-1 text-xs opacity-60">{c.src}</p>
          <a href={c.href} className="mt-3 inline-flex min-h-9 items-center rounded-md bg-accent px-3 text-sm font-bold text-white transition hover:brightness-110">
            See our fix →
          </a>
          <div className="mt-3 flex gap-1" role="tablist" aria-label="Complaints">
            {COMPLAINTS.map((_, i) => (
              <button key={i} role="tab" aria-selected={i === tick} onClick={() => setTick(i)}
                className={`h-1.5 w-6 rounded-full transition ${i === tick ? "bg-primary" : "bg-surface-3"}`} aria-label={`Complaint ${i + 1}`} />
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-surface-3 bg-surface p-4 text-sm shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider opacity-50">Try scripted edge cases</p>
          <ul className="mt-2 grid gap-1.5">
            {[
              ["Gateway timeout recovery", "/book/new?quota=TQ&scenario=pay-fail-recover"],
              ["Tatkal rush queue", "/book/new?quota=TQ&scenario=tatkal-rush"],
              ["WL confirm overnight", "/journey?pnr=4421876503&scenario=wl-confirm-overnight"],
            ].map(([label, href]) => (
              <li key={href}>
                <a href={href} className="font-medium text-primary underline-offset-2 hover:underline">{label} →</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-surface-3 bg-surface p-4 text-[13px] leading-relaxed opacity-80 shadow-sm">
          <strong className="opacity-100">No slop promise:</strong> every number on this screen is from published
          surveys/coverage; every fare from a tested rules engine; every rupee synthetic.
        </div>
      </aside>
    </div>
  );
}

/* Client island boundary lives inside SearchForm itself. */
import SearchForm from "@/app/components/SearchForm";
function SearchSlot() {
  return <SearchForm scenario="clean" />;
}
