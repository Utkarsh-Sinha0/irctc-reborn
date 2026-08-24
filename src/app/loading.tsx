/* G1-WHY: route-level loading state — instant feedback on server renders (Doherty
   threshold, dossier-E §4); skeleton matches layout so no flash.
   G2-BEST: static skeleton group per segment; zero JS. G3-FUTURE: S. */

export default function Loading() {
  return (
    <div aria-busy="true" className="pt-6">
      <div className="h-8 w-2/3 animate-pulse rounded-lg bg-surface-3" />
      <div className="mt-4 h-40 animate-pulse rounded-2xl bg-surface ring-1 ring-surface-3" />
      <div className="mt-3 h-28 animate-pulse rounded-2xl bg-surface ring-1 ring-surface-3" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
