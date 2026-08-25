"use client";
/* G1-WHY: landing v3 — IRCTC identity, information-dense workspace.
 * Top strip: VB hero photo (left) + live stats (right). Then search workspace full-width.
 * Evidence ticker + sample profiles in a right rail on desktop.
 * G2-BEST: RSC shell + SearchForm island; gallery island; zero layout shift.
 * G3-FUTURE: S. */
import { useEffect, useState } from "react";
import VandeBharatSweep from "@/app/components/VandeBharatSweep";
import VBGallery from "@/app/components/VBGallery";

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
    <div className="grid gap-5">
      {/* hero band: photo + key facts, one row on desktop */}
      <div className="grid overflow-hidden rounded-2xl border border-surface-3 bg-surface shadow-sm lg:grid-cols-[1fr_320px]">
        <div className="vb-hero !min-h-[220px] !rounded-none">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#FFB37A]">Vande Bharat era</p>
            <h1 className="mt-1 text-2xl font-extrabold leading-tight lg:text-3xl">
              Every train. Every class. Every quota.<br className="hidden lg:block" /> One screen.
            </h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href="/book/new?quota=TQ" className="min-h-10 rounded-lg bg-accent px-4 py-2 text-sm font-bold text-white transition hover:brightness-110">
                Book Tatkal →
              </a>
              <a href="/book/new?quota=TQ&scenario=pay-fail-recover" className="min-h-10 rounded-lg bg-white/15 px-4 py-2 text-sm font-bold text-white backdrop-blur transition hover:bg-white/25">
                ▶ Payment recovery demo
              </a>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-surface-3 border-t border-surface-3 bg-surface lg:border-l lg:border-t-0">
          {[
            ["1", "request for all quotas"],
            ["12s", "worst-case recovery"],
            ["100%", "fare transparency"],
          ].map(([n, l]) => (
            <div key={l} className="grid place-content-center gap-0.5 p-4 text-center">
              <span className="text-2xl font-extrabold text-primary">{n}</span>
              <span className="text-xs leading-tight opacity-65">{l}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        {/* main column */}
        <section aria-label="Search trains" className="min-w-0">
          <SearchSlot />
        </section>

        {/* right rail */}
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

          <VBGallery />

          <div className="rounded-xl border border-surface-3 bg-surface p-4 text-sm shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider opacity-50">Scripted edge cases</p>
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
            <strong className="opacity-100">Evidence promise:</strong> every number here is from published surveys;
            every fare from a tested rules engine; every rupee synthetic.
          </div>
        </aside>
      </div>

      {/* sweep + strip stay as brand moments */}
      <VandeBharatSweep />
      <div className="vb-strip">
        <p className="text-sm font-semibold">8 Vande Bharat corridors · 12 major stations · every quota, one screen</p>
      </div>
    </div>
  );
}

/* Client island boundary lives inside SearchForm itself. */
import SearchForm from "@/app/components/SearchForm";
function SearchSlot() {
  return <SearchForm scenario="clean" />;
}
