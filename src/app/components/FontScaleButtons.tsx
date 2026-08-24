"use client";
/* G1-WHY: Accessibility toolbar (audit-4) — font scale A−/A+ (100→112.5→125→150%) and
 * high-contrast toggle. IRCTC ships font resize only; this is the full pair, persisted.
 * G2-BEST: data attributes on <html>; localStorage persistence; aria-pressed states.
 * G3-FUTURE: S — tokens only; add "reduce motion" toggle if OS-level proves insufficient. */
import { useEffect, useState } from "react";

const SCALES = ["", "lg", "xl", "2xl"] as const;

export default function FontScaleButtons() {
  const [idx, setIdx] = useState(0);
  const [hc, setHc] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem("yatra-fs");
      if (s) { const i = SCALES.indexOf(s as (typeof SCALES)[number]); if (i >= 0) { setIdx(i); document.documentElement.dataset.fs = SCALES[i]; } }
      if (localStorage.getItem("yatra-hc") === "1") { setHc(true); document.documentElement.dataset.hc = "1"; }
    } catch { /* private mode */ }
  }, []);

  function applyScale(nextIdx: number) {
    const clamped = Math.max(0, Math.min(SCALES.length - 1, nextIdx));
    setIdx(clamped);
    if (SCALES[clamped]) document.documentElement.dataset.fs = SCALES[clamped];
    else delete document.documentElement.dataset.fs;
    try { clamped ? localStorage.setItem("yatra-fs", SCALES[clamped]) : localStorage.removeItem("yatra-fs"); } catch { /* noop */ }
  }

  function applyHc(on: boolean) {
    setHc(on);
    if (on) { document.documentElement.dataset.hc = "1"; try { localStorage.setItem("yatra-hc", "1"); } catch { /* noop */ } }
    else { delete document.documentElement.dataset.hc; try { localStorage.removeItem("yatra-hc"); } catch { /* noop */ } }
  }

  return (
    <div role="group" aria-label="Accessibility: text size and contrast" className="flex items-center gap-1">
      <button onClick={() => applyScale(idx - 1)} disabled={idx === 0} title="Smaller text"
        className="min-h-10 min-w-10 rounded-lg border border-white/40 px-2 font-bold disabled:opacity-40" aria-label="Decrease text size">A−</button>
      <span className="w-8 text-center text-xs tabular-nums opacity-80">{[100, 113, 125, 150][idx]}%</span>
      <button onClick={() => applyScale(idx + 1)} disabled={idx === SCALES.length - 1} title="Larger text"
        className="min-h-10 min-w-10 rounded-lg border border-white/40 px-2 font-bold disabled:opacity-40" aria-label="Increase text size">A+</button>
      <button onClick={() => applyHc(!hc)} aria-pressed={hc} title="High contrast colours"
        className={`min-h-10 rounded-lg border px-2 text-sm font-bold ${hc ? "border-white bg-white text-primary-dark" : "border-white/40"}`}>
        HC
      </button>
    </div>
  );
}
