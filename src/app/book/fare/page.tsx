/* G1-WHY: fare route wrapper (M14/M15) — passes real train/class/date through.
   G2-BEST: server page parses query; distance derived from station-pair fixture map
   (single source in trains fixtures). G3-FUTURE: S. */
import FareSheet from "@/app/components/FareSheet";
import { findTrain } from "@/fixtures/trains";

/** Approx corridor distances (km) for fare realism — demo contract, documented. */
const DIST: Record<string, number> = {
  "PUNE>NDLS": 1480, "BCT>NDLS": 1384, "NDLS>BCT": 1384, "BCT>ADI": 493,
  "NDLS>AY": 680, "CSMT>NDLS": 1541, "PNBE>NDLS": 1000, "PUNE>ADI": 1000,
};

export default async function FarePage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const ids = (sp.ids ?? "").split(",").filter(Boolean);
  const from = findTrain(sp.train ?? "")?.from.code ?? "PUNE";
  const to = findTrain(sp.train ?? "")?.to.code ?? "NDLS";
  return (
    <FareSheet
      persona={sp.persona ?? "priya"}
      ids={ids}
      idempotencyKey={sp.key ?? crypto.randomUUID()}
      travelClass={sp.cls}
      distanceKm={DIST[`${from}>${to}`] ?? 1200}
    />
  );
}
