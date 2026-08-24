"use client";
/* G1-WHY: passenger step (M12/M13) — prefilled master list, age rules visible, child-free
   clarity (edge C2/B5), idempotency key minted at continue (edge E4).
   G2-BEST: client island reading fixtures via props from server page; selection state local;
   rules applied by applyRules() — UI never embeds business logic.
   G3-FUTURE: S. */
import { useMemo, useState } from "react";
import { PERSONAS, type PersonaId } from "@/fixtures/passengers";
import { applyRules } from "@/fixtures/passengers";

export default function PassengerPicker({ persona }: { persona: PersonaId }) {
  const master = useMemo(() => applyRules(PERSONAS[persona].masterList, new Date().toISOString().slice(0, 10)), [persona]);
  const [selected, setSelected] = useState<Set<string>>(new Set(master.slice(0, 1).map(p => p.id)));

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else if (next.size < 6) next.add(id);
      return next;
    });
  }

  const chosen = master.filter(p => selected.has(p.id));
  const chargeable = chosen.filter(p => !p.isChild).length;

  return (
    <section className="pt-6">
      <h1 className="text-2xl font-bold text-primary-dark">Who&apos;s travelling?</h1>
      <p className="mt-1 opacity-75">From your saved travellers — tap to include.</p>

      <ul className="mt-4 grid gap-2">
        {master.map(p => (
          <li key={p.id}>
            <label className={`flex min-h-16 cursor-pointer items-center justify-between rounded-2xl bg-surface px-4 py-3 shadow-sm ring-1 transition ${selected.has(p.id) ? "ring-primary" : "ring-surface-3"}`}>
              <span>
                <span className="block font-semibold">{p.name}</span>
                <span className="block text-base opacity-70">
                  {p.age} yrs · {p.gender}
                  {p.isChild && " · no seat · free"}
                  {p.berthPref === "LOWER" && p.age >= 60 && " · lower berth (senior)"}
                </span>
              </span>
              <input
                type="checkbox"
                checked={selected.has(p.id)}
                onChange={() => toggle(p.id)}
                className="h-7 w-7 accent-[var(--color-primary)]"
              />
            </label>
          </li>
        ))}
      </ul>

      {chargeable > 6 && (
        <p role="alert" className="mt-3 rounded-xl bg-white px-3 py-2 text-error ring-1 ring-error/40">
          Maximum 6 seats per PNR.
        </p>
      )}

      <a
        aria-disabled={chargeable === 0}
        href={chargeable === 0 ? undefined : (() => {
          const params = new URLSearchParams({
            persona,
            ids: chosen.map(p => p.id).join(","),
            key: crypto.randomUUID(),
          });
          return `/book/fare?${params.toString()}`;
        })()}
        onClick={(e) => { if (chargeable === 0) e.preventDefault(); }}
        className={`mt-5 flex min-h-12 items-center justify-center rounded-xl font-semibold text-white transition ${chargeable === 0 ? "pointer-events-none opacity-50" : "bg-primary active:scale-[.99]"}`}
      >
        Continue to fare →
      </a>
    </section>
  );
}
