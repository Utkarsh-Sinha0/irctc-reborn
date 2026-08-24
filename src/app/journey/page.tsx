/* G1-WHY: Journey timeline (M22/M25) — the neglected post-booking lifecycle, now a story.
   Deterministic events seeded by PNR (edge F2/F4); wl-confirm-overnight inserts WL_CONFIRMED.
  G3-FUTURE: S. */

const EVENTS = (pnr: string, withConfirm: boolean) => {
  const base = [
    { t: "Aug 24 · 10:02", kind: "BOOKED", title: "Ticket booked", detail: "Tatkal window · 27 seconds start-to-finish" },
    { t: "Sep 14 · 18:04", kind: "CHART_PREPARED", title: "Chart prepared", detail: "Final chart for your train" },
    { t: "Sep 14 · 22:14", kind: "COACH_ASSIGNED", title: "Coach S4 · berth 12 (LOWER)", detail: "Position near engine side" },
  ];
  if (withConfirm) base.splice(1, 0, { t: "Aug 24 · 23:41", kind: "WL_CONFIRMED", title: "Waitlist confirmed 🎉", detail: "Your WL 12 moved up after cancellations" });
  base.push({ t: "Sep 15 · 05:12", kind: "PLATFORM_HINT", title: "Platform hint: 2", detail: "Confirm on display boards" } as never);
  void pnr;
  return base;
};

export default async function JourneyPage({ searchParams }: { searchParams: Promise<{ pnr?: string; scenario?: string }> }) {
  const { pnr = "0000000000", scenario = "" } = await searchParams;
  const withConfirm = scenario === "wl-confirm-overnight";
  const events = EVENTS(pnr, withConfirm);

  return (
    <section className="pt-6">
      <h1 className="text-2xl font-bold text-primary-dark">Journey timeline</h1>
      <p className="mt-1 opacity-70">PNR <span className="tabular-nums font-semibold">{pnr.slice(0, 5)}·{pnr.slice(5)}</span></p>

      <ol className="mt-5 space-y-0">
        {events.map((e, i) => (
          <li key={i} className="relative grid grid-cols-[1.5rem_1fr] gap-3 pb-6">
            {i < events.length - 1 && <span aria-hidden className="absolute left-[0.68rem] top-6 h-full w-px bg-surface-3" />}
            <span className="z-10 mt-1 inline-block h-3.5 w-3.5 rounded-full border-4 border-primary bg-white" aria-hidden />
            <div>
              <p className="text-base tabular-nums opacity-60">{e.t}</p>
              <p className="font-semibold">{e.title}</p>
              {e.detail && <p className="text-base opacity-75">{e.detail}</p>}
            </div>
          </li>
        ))}
      </ol>

      <div className="rounded-2xl bg-surface p-4 ring-1 ring-surface-3">
        <p className="font-semibold">If it gets cancelled</p>
        <p className="mt-1 text-base opacity-75">Auto-refund to source — no TDR needed (Apr 2026 rules). We&apos;ll suggest alternate trains in the same tap.</p>
        <p lang="hi" className="opacity-60">रद्द होने पर धनवापसी स्वतः — कोई TDR नहीं।</p>
      </div>
    </section>
  );
}
