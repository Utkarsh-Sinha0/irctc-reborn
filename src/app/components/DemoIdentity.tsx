"use client";
/* G1-WHY: identity chip — plain session control. Switch sample profiles in one tap.
 * G2-BEST: fetch /api/auth to switch; reads nothing on server.
 * G3-FUTURE: S. */
import { useEffect, useState } from "react";

const IDS = ["priya", "sharmaji", "fatima"] as const;
const KEY = "yatra-identity";

export default function DemoIdentity() {
  const [current, setCurrent] = useState<string>("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try { setCurrent(localStorage.getItem(KEY) ?? "priya"); } catch { setCurrent("priya"); }
  }, []);

  async function pick(id: (typeof IDS)[number]) {
    setOpen(false);
    try { localStorage.setItem(KEY, id); } catch { /* noop */ }
    await fetch("/api/auth", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ personaId: id }) });
    setCurrent(id);
    location.reload();
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} aria-expanded={open}
        className="flex min-h-8 items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1 text-xs font-semibold hover:bg-white/20">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-accent text-[10px] font-bold text-ink" aria-hidden>
          {(current || "?")[0].toUpperCase()}
        </span>
        <span className="hidden sm:inline">{current || "profile"}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-50 w-48 overflow-hidden rounded-lg bg-surface py-1 text-ink shadow-xl ring-1 ring-black/10">
          {IDS.map(id => (
            <button key={id} onClick={() => void pick(id)}
              className={`block w-full px-3 py-2 text-left text-sm hover:bg-surface-3 ${id === current ? "font-semibold text-primary" : ""}`}>
              {id}
            </button>
          ))}
          <p className="border-t border-surface-3 px-3 py-1.5 text-[11px] opacity-60">Sample profiles — synthetic data only.</p>
        </div>
      )}
    </div>
  );
}
