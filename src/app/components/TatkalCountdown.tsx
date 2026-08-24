"use client";
/* G1-WHY: Tatkal countdown (M04) — the adrenaline beat; server-time-safe (edge A1/A2).
   G2-BEST: computes next 10:00 IST from a fixed offset; visibilitychange recompute;
   no intervals when hidden. G3-FUTURE: S — reused on rush scenario banner. */
import { useEffect, useState } from "react";

function msToNext10IST(now: Date): number {
  // IST = UTC+5:30 → 10:00 IST == 04:30 UTC
  const nowUtcMin = now.getUTCHours() * 60 + now.getUTCMinutes() + now.getUTCSeconds() / 60;
  const target = 4 * 60 + 30;
  let diff = target - nowUtcMin;
  if (diff <= 0) diff += 1440;
  return Math.round(diff * 60_000);
}

function fmt(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${sec}`;
}

export default function TatkalCountdown() {
  const [ms, setMs] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setMs(msToNext10IST(new Date()));
    update();
    const id = setInterval(update, 1000);
    document.addEventListener("visibilitychange", update);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  const open = ms !== null && ms < 60_000;

  return (
    <div
      aria-live="polite"
      className={`rounded-xl px-4 py-3 font-semibold tabular-nums ${open ? "bg-success/10 text-success" : "bg-white/10"}`}
    >
      {open ? "OPEN NOW — go!" : `opens in ${ms === null ? "--:--:--" : fmt(ms)}`}
    </div>
  );
}
