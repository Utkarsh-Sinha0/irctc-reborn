"use client";
/* G1-WHY: Accessibility toolbar (audit-4 + M31/M32) — font scale A−/A+ (100→150%),
 * high-contrast toggle, and Elder preset (applies 150% + HC together, PRD token-preset
 * approach). All persist. Language toggle lives beside it via LangProvider button.
 * G2-BEST: data attributes on <html>; localStorage; aria-pressed states.
 * G3-FUTURE: S — tokens only. */
import { useEffect, useState } from "react";

const SCALES = ["", "lg", "xl", "2xl"] as const;

export default function FontScaleButtons() {
  const [idx, setIdx] = useState(0);
  const [hc, setHc] = useState(false);
  const [elder, setElder] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem("yatra-fs");
      if (s) { const i = SCALES.indexOf(s as (typeof SCALES)[number]); if (i >= 0) { setIdx(i); document.documentElement.dataset.fs = SCALES[i]; } }
      if (localStorage.getItem("yatra-hc") === "1") { setHc(true); document.documentElement.dataset.hc = "1"; }
      if (localStorage.getItem("yatra-elder") === "1") setElder(true);
    } catch { /* private mode */ }
  }, []);

  function applyScale(nextIdx: number) {
    const clamped = Math.max(0, Math.min(SCALES.length - 1, nextIdx));
    setIdx(clamped); setElder(false);
    try { localStorage.removeItem("yatra-elder"); } catch { /* noop */ }
    if (SCALES[clamped]) document.documentElement.dataset.fs = SCALES[clamped];
    else delete document.documentElement.dataset.fs;
    try { clamped ? localStorage.setItem("yatra-fs", SCALES[clamped]) : localStorage.removeItem("yatra-fs"); } catch { /* noop */ }
  }

  function applyHc(on: boolean) {
    setHc(on);
    try { localStorage.setItem("yatra-hc", on ? "1" : "0"); } catch { /* noop */ }
    if (on) document.documentElement.dataset.hc = "1";
    else delete document.documentElement.dataset.hc;
  }

  function applyElder(on: boolean) {
    setElder(on);
    try { localStorage.setItem("yatra-elder", on ? "1" : "0"); } catch { /* noop */ }
    if (on) {
      // Elder preset = 150% scale + high contrast (PRD M31 token approach)
      document.documentElement.dataset.fs = "2xl";
      document.documentElement.dataset.hc = "1";
      setIdx(3); setHc(true);
      try { localStorage.setItem("yatra-fs", "2xl"); localStorage.setItem("yatra-hc", "1"); } catch { /* noop */ }
    } else {
      applyScale(0);
      applyHc(false);
    }
  }

  return (
    <div role="group" aria-label="Accessibility controls" className="flex items-center gap-1">
      <button onClick={() => applyScale(idx - 1)} disabled={idx === 0} title="Smaller text"
        className="min-h-9 min-w-9 rounded-md border border-white/40 px-2 text-sm font-bold disabled:opacity-40" aria-label="Decrease text size">A−</button>
      <button onClick={() => applyScale(idx + 1)} disabled={idx === SCALES.length - 1} title="Larger text"
        className="min-h-9 min-w-9 rounded-md border border-white/40 px-2 text-sm font-bold disabled:opacity-40" aria-label="Increase text size">A+</button>
      <button onClick={() => applyHc(!hc)} aria-pressed={hc} title="High contrast colours"
        className={`min-h-9 rounded-md border px-2 text-xs font-bold ${hc ? "border-white bg-white text-primary-dark" : "border-white/40"}`}>HC</button>
      <button onClick={() => applyElder(!elder)} aria-pressed={elder} title="Elder mode: largest text + high contrast"
        className={`min-h-9 rounded-md border px-2 text-xs font-bold ${elder ? "border-accent bg-accent text-ink" : "border-white/40"}`}>Elder</button>
    </div>
  );
}
