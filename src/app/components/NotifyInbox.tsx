"use client";
/* G1-WHY: Notification inbox (M28) — the proactive layer that powers the retention Trigger
 * loop (doc 10 M9). Deterministic seeded notifications per persona; dedupe + read state.
 * G2-BEST: pure client render of fixture events; no polling loops; aria-live polite.
 * G3-FUTURE: S blast-radius — production swaps the source for the outbox consumer. */
import { useMemo, useState } from "react";

type Note = { id: string; atIso: string; title: string; body: string; kind: "info" | "good" | "warn" };

const SEED: Record<string, Note[]> = {
  priya: [
    { id: "n1", atIso: "Today · 10:02", title: "Tatkal window armed", body: "Pre-staged for Pune → Delhi. Wallet iPay ready.", kind: "info" },
    { id: "n2", atIso: "Yesterday · 22:14", title: "Waitlist confirmed 🎉", body: "WL 12 → CNF on 12290 Duronto. Coach S4 · 12 LB.", kind: "good" },
    { id: "n3", atIso: "Yesterday · 09:10", title: "Fare drop on your route", body: "3A dropped ₹210 for Sep 15.", kind: "good" },
  ],
  sharmaji: [
    { id: "n1", atIso: "Today · 08:00", title: "आपकी यात्रा नज़दीक है", body: "Ayodhya Dham · Sep 2 · Coach B2 · 34 LB", kind: "info" },
    { id: "n2", atIso: "Mon · 18:30", title: "Platform hint updated", body: "Platform 2 expected.", kind: "info" },
  ],
  fatima: [
    { id: "n1", atIso: "Today · 07:45", title: "Family trip ready to pay", body: "6 travellers · draft saved. Total frozen at quote.", kind: "info" },
    { id: "n2", atIso: "Sun · 20:00", title: "Lower berths allotted to seniors", body: "Amna (70) and you — as requested.", kind: "good" },
  ],
};

const KIND_STYLE = { info: "bg-surface-3", good: "bg-success/10", warn: "bg-warn/10" } as const;

export default function NotifyInbox({ persona }: { persona: string }) {
  const notes = useMemo(() => SEED[persona] ?? [], [persona]);
  const [read, setRead] = useState<Set<string>>(new Set());
  const unread = notes.length - read.size;

  return (
    <section className="pt-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Notifications</h2>
        <span className="rounded-full bg-primary px-2 py-0.5 text-sm font-semibold text-white" aria-label={`${unread} unread`}>
          {unread}
        </span>
      </div>
      <ul aria-live="polite" className="mt-2 grid gap-2">
        {notes.map(n => {
          const isRead = read.has(n.id);
          return (
            <li key={n.id}>
              <button
                onClick={() => setRead(prev => new Set(prev).add(n.id))}
                className={`w-full rounded-xl p-3 text-left ring-1 transition ${KIND_STYLE[n.kind]} ${isRead ? "opacity-60 ring-transparent" : "ring-primary/30"}`}
              >
                <span className="flex items-center justify-between">
                  <strong className={!isRead ? "" : "font-normal"}>{n.title}</strong>
                  <span className="text-sm tabular-nums opacity-60">{n.atIso}</span>
                </span>
                <span className="mt-0.5 block text-base opacity-80">{n.body}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {notes.length === 0 && <p className="text-base opacity-70">Nothing yet.</p>}
    </section>
  );
}
