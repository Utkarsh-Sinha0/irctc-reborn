"use client";
/* G1-WHY: search form + results (M07–M11) — the golden path's decision screen.
   G2-BEST: client island calls /api/search (URL params mirrored for shareability);
   bands/worst-case rendered straight from payload — no UI math. Skeleton min 400ms.
   G3-FUTURE: S — scenario param passes through untouched. */
import { useCallback, useEffect, useState } from "react";

type Avail = {
  trainNumber: string; journeyDate: string;
  travelClass: string; quota: string;
  kind: "AVAILABLE" | "RAC" | "WL"; count: number;
  confirmBandPct: number; worstCase: string; autoRefundIfNot: boolean;
  noteKey?: "high" | "medium" | "low" | "rac";
};
type Group = { train: { number: string; name: string; depTime: string; arrTime: string; durationMin: number }; availabilities: Avail[] };

const KIND_STYLE: Record<Avail["kind"], string> = {
  AVAILABLE: "bg-success/10 text-success",
  RAC: "bg-warn/10 text-warn",
  WL: "bg-error/10 text-error",
};

export default function SearchForm({ initialQuota }: { initialQuota: "GN" | "TQ" }) {
  const tomorrow = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
  const [from, setFrom] = useState("PUNE");
  const [to, setTo] = useState("NDLS");
  const [date, setDate] = useState(tomorrow);
  const [quota, setQuota] = useState<"GN" | "TQ">(initialQuota);
  const [loading, setLoading] = useState(false);
  const [minWait, setMinWait] = useState(false);
  const [groups, setGroups] = useState<Group[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const search = useCallback(async () => {
    if (from === to) { setErr("Origin and destination must differ."); return; }
    setLoading(true); setErr(null); setGroups(null);
    const t0 = Date.now();
    try {
      const res = await fetch(`/api/search?from=${from}&to=${to}&date=${date}&quota=${quota}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message ?? "search failed");
      // skeleton min-display 400ms (no flash)
      const wait = Math.max(0, 400 - (Date.now() - t0));
      setTimeout(() => { setGroups(json.data.groups); setLoading(false); }, wait);
      setMinWait(true);
    } catch {
      setErr("Search failed. Check connection and retry."); setLoading(false);
    }
  }, [from, to, date, quota]);

  useEffect(() => { if (initialQuota === "TQ") search(); /* auto-search armed entries */ }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="pt-6">
      <h1 className="text-2xl font-bold text-primary-dark">Where to?</h1>

      <form className="mt-4 grid gap-3 rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-surface-3"
        onSubmit={(e) => { e.preventDefault(); void search(); }}>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-base font-medium">From
            <input value={from} onChange={e => setFrom(e.target.value.toUpperCase())}
              className="mt-1 w-full min-h-12 rounded-xl border border-surface-3 bg-surface-2 px-3 font-semibold uppercase" maxLength={6} />
          </label>
          <label className="text-base font-medium">To
            <input value={to} onChange={e => setTo(e.target.value.toUpperCase())}
              className="mt-1 w-full min-h-12 rounded-xl border border-surface-3 bg-surface-2 px-3 font-semibold uppercase" maxLength={6} />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-base font-medium">Date
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="mt-1 w-full min-h-12 rounded-xl border border-surface-3 bg-surface-2 px-3" />
          </label>
          <fieldset className="text-base font-medium">
            <legend>Quota</legend>
            <div className="mt-1 flex min-h-12 items-center gap-2">
              {(["GN", "TQ"] as const).map(q => (
                <button type="button" key={q} onClick={() => setQuota(q)} aria-pressed={quota === q}
                  className={`flex-1 rounded-xl px-3 py-2 ring-1 ${quota === q ? "bg-primary text-white ring-primary" : "bg-surface-2 ring-surface-3"}`}>
                  {q === "TQ" ? "Tatkal" : "General"}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
        <button type="submit" disabled={loading}
          className="min-h-12 rounded-xl bg-primary font-semibold text-white active:scale-[.99] transition disabled:opacity-60">
          {loading ? "Searching…" : "Search trains →"}
        </button>
        {err && <p role="alert" className="rounded-xl bg-white px-3 py-2 text-error ring-1 ring-error/40">⚠ {err}</p>}
      </form>

      {(loading || groups) && (
        <div aria-live="polite" className="mt-5 grid gap-3">
          {loading && !groups &&
            [0, 1, 2].map(i => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-surface ring-1 ring-surface-3" />
            ))}
          {!loading && groups?.length === 0 && (
            <p className="rounded-2xl bg-surface p-4 ring-1 ring-surface-3">
              No direct trains found. Try nearby dates or a popular pair like PUNE→NDLS.
            </p>
          )}
          {groups?.map(g => (
            <article key={g.train.number} className="rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-surface-3">
              <header className="flex items-baseline justify-between">
                <h2 className="font-semibold">{g.train.name}</h2>
                <span className="text-base opacity-60">#{g.train.number}</span>
              </header>
              <p className="tabular-nums opacity-80">
                {g.train.depTime} → {g.train.arrTime} · {Math.floor(g.train.durationMin / 60)}h {g.train.durationMin % 60}m
              </p>
              <ul className="mt-3 grid gap-2">
                {g.availabilities.map(a => (
                  <li key={`${a.travelClass}-${a.quota}`} className={`rounded-xl p-3 ${KIND_STYLE[a.kind]}`}>
                    <div className="flex items-center justify-between font-semibold">
                      <span>{a.travelClass} · ₹ fare on next step</span>
                      <span className="rounded-full bg-white/70 px-2 py-0.5 text-sm">{a.kind}{a.kind !== "AVAILABLE" ? ` ${a.count}` : ` ${a.count}`}</span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/70">
                      <div className="h-full rounded-full bg-current opacity-80" style={{ width: `${a.confirmBandPct}%` }} />
                    </div>
                    <p className="mt-1 text-base">
                      <strong data-testid={`band-${g.train.number}-${a.travelClass}`}>{a.confirmBandPct}% likely</strong>
                      {" · worst case: "}{a.worstCase}
                      {a.autoRefundIfNot ? " · auto-refund if not confirmed" : ""}
                    </p>
                  </li>
                ))}
              </ul>
              <a
                href={`/book/passengers?train=${g.train.number}&date=${date}&quota=${quota}`}
                className="mt-3 flex min-h-12 items-center justify-center rounded-xl bg-primary font-semibold text-white active:scale-[.99] transition"
              >
                Select & add passengers →
              </a>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
