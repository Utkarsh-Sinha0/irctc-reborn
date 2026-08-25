"use client";
/* G1-WHY: landing = the booking workspace itself (no marketing surface, no personas).
 * Vande Bharat sweep banner (outline SVG, right→left) + dense search strip + evidence
 * ticker of REAL citizen complaints. Photo strip from CC-licensed Wikimedia shots.
 * G2-BEST: reuses SearchForm engine wiring; complaint data is research ground truth.
 * G3-FUTURE: S. */
import { useEffect, useState } from "react";
import VandeBharatSweep from "@/app/components/VandeBharatSweep";

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
    <div className="grid gap-6">
      {/* Hero: the real orange-snake livery shot + official drone footage embed */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="vb-hero">
          <p className="text-xs font-bold uppercase tracking-widest text-[#FFB37A]">Vande Bharat · the train this product is built for</p>
          <h2 className="mt-1 text-2xl font-extrabold leading-tight lg:text-3xl">Booking should move<br />as fast as the train.</h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-white/85">
            One search shows every class × every quota. Payment failures recover themselves.
            Refunds are visible before you cancel.
          </p>
          <p className="mt-3 text-[11px] text-white/60">Photo: Vande Bharat Express, CC BY-SA 4.0, Wikimedia Commons</p>
        </section>

        <section className="overflow-hidden rounded-2xl border border-surface-3 bg-surface shadow-sm">
          <div className="aspect-video w-full">
            <iframe
              className="h-full w-full"
              src="https://www.youtube.com/embed/gwX-mo0_Xy8"
              title="Vande Bharat drone view — Western Ghats (West Central Railway, official)"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
          <p className="px-3 py-2 text-[11px] leading-tight opacity-60">
            Official drone footage via West Central Railway, YouTube · the viral &ldquo;orange snake&rdquo; ghat-section run
          </p>
        </section>
      </div>

      {/* Vande Bharat sweep banner */}
      <VandeBharatSweep />

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

        <div className="rounded-xl border border-surface-3 bg-surface p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider opacity-50">Sample profiles</p>
          <p className="mt-1 text-[13px] leading-snug opacity-70">Adaptive home demos — each reorders the workspace for a traveller type. Synthetic, no real accounts.</p>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {[["priya", "Tatkal racer"], ["sharmaji", "Elder · 68"], ["fatima", "Family of 6"]].map(([id, label]) => (
              <a key={id} href={`/home/${id}`}
                className="min-h-16 rounded-lg bg-surface-3 px-2 py-2 text-center transition hover:bg-primary/10">
                <span className="block text-sm font-semibold capitalize">{id}</span>
                <span className="block text-[11px] leading-tight opacity-65">{label}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-surface-3 bg-surface p-4 text-[13px] leading-relaxed opacity-80 shadow-sm">
          <strong className="opacity-100">Evidence promise:</strong> every number on this screen is from published
          surveys/coverage; every fare from a tested rules engine; every rupee synthetic.
        </div>

        {/* real Vande Bharat, CC-licensed (attribution required by CC BY-SA) */}
        <div className="rounded-xl border border-surface-3 bg-surface p-2 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/vb/platform.jpg" alt="Vande Bharat Express at New Delhi platform (CC BY-SA 4.0, Wikimedia)" className="h-28 w-full rounded-lg object-cover" />
          <p className="px-1 pt-1 text-[11px] leading-tight opacity-55">
            Vande Bharat Express, New Delhi · photo CC BY-SA 4.0 via Wikimedia Commons
          </p>
        </div>
      </aside>
      </div>
    </div>
  );
}

/* Client island boundary lives inside SearchForm itself. */
import SearchForm from "@/app/components/SearchForm";
function SearchSlot() {
  return <SearchForm scenario="clean" />;
}
