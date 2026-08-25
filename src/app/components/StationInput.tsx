"use client";
/* G1-WHY: M07 station autocomplete — real station codes (dossier-A fixtures), keyboard
 * navigable, ARIA combobox pattern. Fixes IRCTC's screen-reader-hostile station widget.
 * G2-BEST: datalist-free custom listbox (full control of a11y roles); 12 codes.
 * G3-FUTURE: S. */
import { useMemo, useRef, useState } from "react";

export const STATIONS = [
  { code: "NDLS", name: "New Delhi" },
  { code: "PUNE", name: "Pune Jn" },
  { code: "BCT", name: "Mumbai Central" },
  { code: "CSMT", name: "C Shivaji Mah T" },
  { code: "ADI", name: "Ahmedabad Jn" },
  { code: "AY",   name: "Ayodhya Dham" },
  { code: "PNBE", name: "Patna Jn" },
  { code: "CNB",  name: "Kanpur Central" },
  { code: "LKO",  name: "Lucknow Charbagh NR" },
  { code: "HWH",  name: "Howrah Jn" },
  { code: "MAS",  name: "MGR Chennai Ctr" },
  { code: "SBC",  name: "KSR Bengaluru" },
] as const;

interface Props { label: string; value: string; onChange: (code: string) => void; }

export default function StationInput({ label, value, onChange }: Props) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const matches = useMemo(() => {
    if (!q) return STATIONS.slice(0, 8);
    const needle = q.toUpperCase();
    return STATIONS.filter(s => s.code.includes(needle) || s.name.toUpperCase().includes(needle)).slice(0, 8);
  }, [q]);

  function pick(code: string) {
    onChange(code);
    setQ("");
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) { setOpen(true); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(a => Math.min(a + 1, matches.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    else if (e.key === "Enter" && open && matches[active]) { e.preventDefault(); pick(matches[active].code); }
    else if (e.key === "Escape") setOpen(false);
  }

  return (
    <div className="relative">
      <label className="block text-base font-medium">
        {label}
        <input
          role="combobox"
          aria-expanded={open}
          aria-controls="station-list"
          aria-autocomplete="list"
          autoComplete="off"
          value={open ? q : value}
          onFocus={() => { setOpen(true); setActive(0); }}
          onBlur={() => { blurTimer.current = setTimeout(() => setOpen(false), 120); }}
          onChange={e => { setQ(e.target.value); setOpen(true); setActive(0); }}
          onKeyDown={onKeyDown}
          placeholder="Code or name"
          className="mt-1 w-full min-h-12 rounded-xl border border-surface-3 bg-surface-2 px-3 font-semibold uppercase"
          maxLength={20}
        />
      </label>
      {value && !open && <span className="pointer-events-none absolute bottom-3 right-3 text-[11px] font-bold text-primary">{value}</span>}
      {open && matches.length > 0 && (
        <ul id="station-list" role="listbox" aria-label={`${label} stations`}
          onMouseDown={() => { if (blurTimer.current) clearTimeout(blurTimer.current); }}
          className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-xl bg-surface py-1 shadow-xl ring-1 ring-black/15">
          {matches.map((s, i) => (
            <li key={s.code} role="option" aria-selected={i === active}>
              <button type="button"
                onClick={() => pick(s.code)}
                onMouseEnter={() => setActive(i)}
                className={`flex w-full items-baseline justify-between px-3 py-2 text-left text-sm ${i === active ? "bg-surface-3 font-semibold" : ""}`}>
                <span>{s.name}</span>
                <span className="font-mono font-bold text-primary">{s.code}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
