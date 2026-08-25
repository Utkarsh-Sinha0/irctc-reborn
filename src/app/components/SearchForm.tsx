"use client";
/* G1-WHY: One-Shot search (user directive) — ALL quotas (General/Tatkal/Premium Tatkal)
   for every class render in ONE row, preloaded from a single request. No quota picker,
   no re-searching per category or date change within the visible corridor. Tap a cell →
   straight to passengers with that exact train+class+quota.
   G2-BEST: single /api/search call returns the full matrix; cells are pure renders of
   engine output; skeleton min 400ms; memory-light (no cached duplicates).
   G3-FUTURE: S — scenario passthrough preserved; matrix engine owns all rules. */
import { useCallback, useEffect, useState } from "react";
import StationInput from "@/app/components/StationInput";
import OtpVerify from "@/app/components/OtpVerify";
import { SearchingArt } from "@/app/components/Art";
import { useLang } from "@/app/components/lang";

type Cell = {
  quota: "GN" | "TQ" | "PT";
  kind: "AVAILABLE" | "RAC" | "WL";
  count: number;
  confirmBandPct: number;
  worstCase: string;
  autoRefundIfNot: boolean;
  premiumX?: number;
};
type Row = { travelClass: string; cells: Cell[] };
type Group = {
  train: { number: string; name: string; depTime: string; arrTime: string; durationMin: number };
  matrix: Row[];
};

const QUOTA_LABEL = { GN: "General", TQ: "Tatkal", PT: "Premium Tatkal" } as const;
const KIND_DOT: Record<Cell["kind"], string> = {
  AVAILABLE: "bg-success",
  RAC: "bg-warn",
  WL: "bg-error",
};
/** Color-blind redundancy: kind is never color-only — glyph + word always ride along (audit-4). */
const KIND_GLYPH: Record<Cell["kind"], string> = { AVAILABLE: "✓", RAC: "◐", WL: "⏳" };
const KIND_TEXT: Record<Cell["kind"], string> = {
  AVAILABLE: "text-success",
  RAC: "text-warn",
  WL: "text-error",
};

export default function SearchForm({ initialQuota, scenario }: { initialQuota?: "GN" | "TQ"; scenario: string }) {
  void initialQuota; // kept for URL compatibility — quota picker is gone by design
  const { t } = useLang();
  const tomorrow = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
  const [from, setFrom] = useState("PUNE");
  const [to, setTo] = useState("NDLS");
  const [date, setDate] = useState(tomorrow);
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<Group[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  // M02: identity gate — first booking action asks a paste-friendly OTP (any 6 digits).
  const [otpDone, setOtpDone] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  // M24: watcher — honest arming state per cell key; armed = "watching ✓".
  const [watcherArmed, setWatcherArmed] = useState<string | null>(null);

  const search = useCallback(async () => {
    if (from === to) { setErr("Origin and destination must differ."); return; }
    setLoading(true); setErr(null); setGroups(null);
    const t0 = Date.now();
    try {
      const res = await fetch(`/api/search?from=${from}&to=${to}&date=${date}&scenario=${encodeURIComponent(scenario)}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message ?? "search failed");
      setTimeout(() => { setGroups(json.data.groups); setLoading(false); }, Math.max(0, 400 - (Date.now() - t0)));
    } catch {
      setErr("Search failed. Check connection and retry."); setLoading(false);
    }
  }, [from, to, date, scenario]);

  useEffect(() => { void search(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** Cell tap → passengers with EXACT selection. No extra steps, no refresh loops. */
  function onward(trainNo: string, cls: string, quota: Cell["quota"]): string {
    const sp = new URLSearchParams({
      persona: "priya", train: trainNo, cls,
      quota, date, scenario, key: crypto.randomUUID(), ids: "",
    });
    return `/book/passengers?${sp.toString()}`;
  }

  return (
    <section className="pt-6">
      <h1 className="text-2xl font-bold text-primary-dark">Where to?</h1>
      <p className="mt-1 text-base opacity-75">Every class · every quota · one screen — pick your cell.</p>

      <form className="mt-4 grid gap-3 rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-surface-3 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end"
        onSubmit={(e) => { e.preventDefault(); void search(); }}>
        <StationInput label={t("From", "कहाँ से")} value={from} onChange={setFrom} />
        <StationInput label={t("To", "कहाँ तक")} value={to} onChange={setTo} />
        <label className="text-base font-medium">{t("Date", "तारीख")}
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="mt-1 w-full min-h-12 rounded-xl border border-surface-3 bg-surface-2 px-3" />
        </label>
        {/* live search on date change — no submit needed */}
        <button type="submit" disabled={loading}
          className="min-h-12 rounded-xl bg-primary px-8 font-semibold text-white active:scale-[.99] transition disabled:opacity-60">
          {loading ? "…" : t("Search", "खोजें")}
        </button>
        {err && <p role="alert" className="rounded-xl bg-white px-3 py-2 text-error ring-1 ring-error/40 md:col-span-4">⚠ {err}</p>}
      </form>

      <div aria-live="polite" className="mt-5 grid gap-3">
        {loading && !groups && (
          <>
            <SearchingArt />
            {[0, 1].map(i => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-surface ring-1 ring-surface-3" />
            ))}
          </>
        )}
        {!loading && groups?.length === 0 && (
          <p className="rounded-2xl bg-surface p-4 ring-1 ring-surface-3">
            No direct trains found. Try nearby dates or PUNE→NDLS.
          </p>
        )}
        {groups?.map(g => (
          <article key={g.train.number} className="overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-surface-3">
            <header className="flex items-baseline justify-between bg-surface-3 px-4 py-2">
              <h2 className="font-semibold">{g.train.name}</h2>
              <span className="text-base tabular-nums opacity-70">
                {g.train.depTime}→{g.train.arrTime} · {Math.floor(g.train.durationMin / 60)}h{String(g.train.durationMin % 60).padStart(2, "0")}
              </span>
            </header>

            <table className="w-full text-left">
              <thead>
                <tr className="text-sm uppercase tracking-wide opacity-60">
                  <th className="px-4 py-2 font-medium">Class</th>
                  <th className="px-2 py-2 font-medium">General</th>
                  <th className="px-2 py-2 font-medium">Tatkal</th>
                  <th className="px-2 py-2 font-medium">Premium TK</th>
                </tr>
              </thead>
              <tbody>
                {g.matrix.map(row => (
                  <tr key={row.travelClass} className="border-t border-surface-3">
                    <th scope="row" className="px-4 py-3 font-bold text-primary">{row.travelClass}</th>
                    {row.cells.map(cell => {
                      const label = cell.kind === "AVAILABLE"
                        ? `${cell.count}`
                        : `${cell.kind} ${cell.count}`;
                      const bandLine = cell.kind !== "AVAILABLE"
                        ? `${cell.confirmBandPct}% likely`
                        : "confirmed";
                      return (
                        <td key={cell.quota} className="px-2 py-2 align-top">
                          <a
                            href={otpDone ? onward(g.train.number, row.travelClass, cell.quota) : undefined}
                            data-testid={`cell-${g.train.number}-${row.travelClass}-${cell.quota}`}
                            onClick={(e) => {
                              if (!otpDone) { e.preventDefault(); setShowOtp(true); }
                            }}
                            aria-disabled={!otpDone}
                            className={`block min-h-14 rounded-xl p-2 ring-1 transition ${otpDone ? "ring-surface-3 hover:ring-primary active:scale-[.98]" : "ring-surface-3/70"}`}
                          >
                            <span className="flex items-center gap-1.5">
                              <span className={`inline-block h-2 w-2 rounded-full ${KIND_DOT[cell.kind]}`} aria-hidden />
                              <span aria-hidden className={`font-semibold ${KIND_TEXT[cell.kind]}`}>{KIND_GLYPH[cell.kind]}</span>
                              <span className={`font-semibold ${KIND_TEXT[cell.kind]}`}>{label}</span>
                            </span>
                            <span className="block text-sm opacity-75">{bandLine}</span>
                            {cell.quota === "PT" && cell.premiumX && (
                              <span className="block text-sm opacity-60">{cell.premiumX}× fare</span>
                            )}
                            {!cell.autoRefundIfNot && cell.quota !== "PT" && (
                              <button
                                type="button"
                                title="Arm a waitlist watcher for this train+date"
                                onClick={(ev) => { ev.preventDefault(); setWatcherArmed(`${g.train.number}-${row.travelClass}-${cell.quota}`); }}
                                className="mt-1 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary hover:bg-primary/20"
                              >
                                {watcherArmed === `${g.train.number}-${row.travelClass}-${cell.quota}` ? "👁 watching ✓" : "👁 watch"}
                              </button>
                            )}
                            <span className="sr-only">{QUOTA_LABEL[cell.quota]} quota</span>
                          </a>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </article>
        ))}
      </div>

      {showOtp && !otpDone && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label="Verify identity">
          <div className="w-full max-w-sm">
            <OtpVerify personaId="priya" onDone={() => { setOtpDone(true); setShowOtp(false); }} />
            <button onClick={() => setShowOtp(false)}
              className="mt-2 w-full min-h-10 rounded-lg bg-surface text-sm font-medium opacity-75 ring-1 ring-surface-3">
              Later
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
