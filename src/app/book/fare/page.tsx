/* G1-WHY: fare route wrapper (M14/M15) — full journey context through, SSR-safe
   (audit-2 F2: no client-side location reads).
   G2-BEST: distance from station-pair fixture map; scenario forwarded.
   G3-FUTURE: S. */
import FareSheet from "@/app/components/FareSheet";
import { findTrain } from "@/fixtures/trains";

/** Approx corridor distances (km) — demo contract, documented on /how-it-works. */
const DIST: Record<string, number> = {
  "PUNE>NDLS": 1480, "BCT>NDLS": 1384, "NDLS>BCT": 1384, "BCT>ADI": 493,
  "NDLS>AY": 680, "CSMT>NDLS": 1541, "PNBE>NDLS": 1000, "PUNE>ADI": 1000,
};

export default async function FarePage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const ids = (sp.ids ?? "").split(",").filter(Boolean);
  const train = findTrain(sp.train ?? "");
  const from = train?.from.code ?? "PUNE";
  const to = train?.to.code ?? "NDLS";
  return (
    <FareSheet
      persona={sp.persona ?? "priya"}
      ids={ids}
      idempotencyKey={sp.key ?? crypto.randomUUID()}
      travelClass={sp.cls}
      quota={sp.quota}
      date={sp.date}
      train={sp.train}
      scenario={sp.scenario}
      distanceKm={DIST[`${from}>${to}`] ?? 1200}
    />
  );
}
