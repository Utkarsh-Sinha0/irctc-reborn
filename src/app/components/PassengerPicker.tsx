"use client";
/* G1-WHY: passenger step (M12/M13) — prefilled master list, age rules visible, child-free
   clarity, idempotency key minted at continue. Audit-2 F1/F3: forwards train/cls/date/quota/
   scenario untouched so fare quotes the REAL selection.
   G2-BEST: rules applied by applyRules() — UI never embeds business logic.
   G3-FUTURE: S. */
import { useMemo, useState } from "react";
import { PERSONAS, applyRules, type PersonaId } from "@/fixtures/passengers";

export default function PassengerPicker({
  persona, train, cls, date, quota, scenario,
}: {
  persona: PersonaId; train?: string; cls?: string;
  date?: string; quota?: string; scenario?: string;
}) {
  const journeyDate = date ?? new Date(Date.now() + 864e5).toISOString().slice(0, 10);
  const master = useMemo(() => applyRules(PERSONAS[persona].masterList, journeyDate), [persona, journeyDate]);
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

  function onwardHref(): string | undefined {
    if (chargeable === 0 || !train) return undefined;
    const sp = new URLSearchParams({
      persona, train,
      ...(cls ? { cls } : {}),
      date: journeyDate,
      quota: quota ?? "GN",
      ids: chosen.map(p => p.id).join(","),
      key: crypto.randomUUID(),
      scenario: scenario ?? "clean",
    });
    return `/book/fare?${sp.toString()}`;
  }
  const href = onwardHref();

  return (
    <section className="pt-6">
      <a href={train ? `/book/new?quota=${quota ?? "GN"}&scenario=${scenario ?? "clean"}` : "/"} className="text-base text-primary underline underline-offset-2">← back to results</a>
      <h1 className="mt-3 text-2xl font-bold text-primary-dark">Who&apos;s travelling?</h1>
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

      <a
        aria-disabled={!href}
        href={href}
        onClick={(e) => { if (!href) e.preventDefault(); }}
        className={`mt-5 flex min-h-12 items-center justify-center rounded-xl font-semibold text-white transition ${href ? "bg-primary active:scale-[.99]" : "pointer-events-none opacity-50"}`}
      >
        Continue to fare →
      </a>
    </section>
  );
}
