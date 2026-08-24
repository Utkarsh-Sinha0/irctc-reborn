"use client";
/* G1-WHY: persona login (M01/M02) — the judge's first tap; must be ≤2 taps to a session.
   G2-BEST: chips call /api/auth (signed cookie) then route to /home/[persona]; guest = priya w/o cookie.
   G3-FUTURE: S blast-radius — personas come from fixtures, so adding one needs no edit here. */
import { useState } from "react";
import { PERSONAS, type PersonaId } from "@/fixtures/passengers";

export default function LoginPage() {
  const [busy, setBusy] = useState<PersonaId | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function enter(p: PersonaId) {
    setBusy(p);
    setErr(null);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ personaId: p }),
      });
      if (!res.ok) throw new Error("auth failed");
      location.href = `/home/${p}`;
    } catch {
      setErr("Could not sign in. Try again.");
      setBusy(null);
    }
  }

  return (
    <section className="pt-6">
      <h1 className="text-2xl font-bold text-primary-dark">Book trains like it&apos;s 2026.</h1>
      <p className="mt-1 opacity-80">Pick a traveller to continue — each shows a different home.</p>

      <div className="mt-5 grid gap-3">
        {(Object.keys(PERSONAS) as PersonaId[]).map((id) => {
          const p = PERSONAS[id];
          return (
            <button
              key={id}
              onClick={() => enter(id)}
              disabled={busy !== null}
              className="w-full min-h-20 rounded-2xl bg-surface p-4 text-left shadow-sm ring-1 ring-surface-3 active:scale-[.99] transition disabled:opacity-50"
            >
              <span className="block font-semibold text-primary">{p.name}</span>
              <span className="block text-base opacity-75">{p.tagline}</span>
            </button>
          );
        })}
        <button
          onClick={() => location.assign("/home/priya?guest=1")}
          className="min-h-12 rounded-xl px-4 py-2 text-primary underline underline-offset-4"
        >
          Try as guest →
        </button>
      </div>

      {err && (
        <p role="alert" className="mt-3 rounded-xl bg-white px-4 py-2 ring-1 ring-error/40 text-error">
          ⚠ {err}
        </p>
      )}
    </section>
  );
}
