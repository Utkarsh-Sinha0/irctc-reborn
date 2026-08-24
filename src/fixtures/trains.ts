/**
 * G1-WHY: F1 train fixtures — every search/result/timeline screen renders from these.
 * Deterministic via seed (PRD §4.1); real station codes and coach structures for
 * credibility (dossier-A flow replication spec).
 * G2-BEST: single static curated array (no mutation hacks), seeded availability fn.
 * G3-FUTURE: blast-radius M. CI pins hash of availabilityFor output (edge H5).
 */
import { mulberry32, hashSeed } from "@/lib/rng";
import type { TrainSummary, Availability, TravelClass, Quota } from "@/lib/types";

export const STATIONS = {
  NDLS: { code: "NDLS", name: "New Delhi", nameHi: "नई दिल्ली" },
  BCT:  { code: "BCT", name: "Mumbai Central", nameHi: "मुंबई सेंट्रल" },
  CSMT: { code: "CSMT", name: "Mumbai CSMT", nameHi: "मुंबई सीएसएमटी" },
  PNBE: { code: "PNBE", name: "Patna", nameHi: "पटना" },
  LKO:  { code: "LKO", name: "Lucknow", nameHi: "लखनऊ" },
  PUNE: { code: "PUNE", name: "Pune Jn", nameHi: "पुणे" },
  ADI:  { code: "ADI", name: "Ahmedabad", nameHi: "अहमदाबाद" },
  AY:   { code: "AY", name: "Ayodhya Dham", nameHi: "अयोध्या धाम" },
  MAS:  { code: "MAS", name: "Chennai Central", nameHi: "चेन्नई सेंट्रल" },
  HWH:  { code: "HWH", name: "Howrah", nameHi: "हावड़ा" },
} as const;

function durMin(dep: string, arr: string): number {
  const [dh, dm] = dep.split(":").map(Number);
  const [ah, am] = arr.split(":").map(Number);
  return ((ah * 60 + am) - (dh * 60 + dm) + 1440) % 1440;
}

const t = (
  number: string, name: string,
  from: keyof typeof STATIONS, to: keyof typeof STATIONS,
  depTime: string, arrTime: string, runsOn: number[]
): TrainSummary => ({
  number, name,
  from: STATIONS[from], to: STATIONS[to],
  depTime, arrTime,
  durationMin: durMin(depTime, arrTime),
  runsOn,
});

/** Curated corridors (PRD A.6): fixture-realistic numbers/times on real routes. */
export const TRAINS_ALL: TrainSummary[] = [
  t("12951", "Mumbai Rajdhani",        "BCT",  "NDLS", "17:00", "08:35", [0,1,2,3,4,5,6]),
  t("12952", "Mumbai Rajdhani (ret)",  "NDLS", "BCT",  "16:25", "08:15", [0,1,2,3,4,5,6]),
  t("12009", "Ahmedabad Shatabdi",     "BCT",  "ADI",  "06:25", "13:05", [1,2,3,4,5,6]),
  t("22435", "Vande Bharat (Varanasi)","NDLS", "AY",   "06:00", "14:00", [0,1,2,3,4,5,6]),
  t("12137", "Punjab Mail",            "CSMT", "NDLS", "19:35", "20:10", [0,1,2,3,4,5,6]),
  t("12309", "Rajendra Nagar Raj",     "PNBE", "NDLS", "19:00", "07:20", [0,1,2,3,4,5,6]),
  t("12290", "Duronto Express",        "PUNE", "NDLS", "08:10", "04:05", [0,1,2,3,4,5,6]),
  t("22962", "Karnataka Superfast",    "PUNE", "ADI",  "15:30", "23:45", [0,1,2,3,4,5,6]),
];

/** Classes with coach structure per dossier-A §A.6. */
export const CLASS_COACHES: Record<TravelClass, string[]> = {
  "1A": ["H1"],
  EC:  ["E1"],
  "2A": ["A1", "A2"],
  "3A": ["B1", "B2", "B3", "B4"],
  "3E": ["E1", "E2"],
  CC:  ["C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8"],
  SL:  ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10", "S11"],
  "2S": ["D1", "D2", "D3", "D4", "D5", "D6"],
};

const CLASSES_BY_TRAIN: Record<string, TravelClass[]> = {
  default: ["1A", "2A", "3A", "SL"],
};

export function classesFor(trainNumber: string): TravelClass[] {
  if (trainNumber.startsWith("120") || trainNumber.startsWith("224")) return ["CC", "EC"];
  return CLASSES_BY_TRAIN.default;
}

/**
 * Deterministic availability for train+date+class+quota under an optional scenario key.
 * Same inputs → same outputs forever (seed pinned by CI snapshot test).
 */
export function availabilityFor(opts: {
  trainNumber: string; journeyDate: string;
  travelClass: TravelClass; quota: Quota; scenarioKey?: string;
}): Omit<Availability, "confirmBandPct" | "worstCase"> {
  const { trainNumber, journeyDate, travelClass, quota, scenarioKey = "" } = opts;
  const rng = mulberry32(hashSeed(`${trainNumber}|${journeyDate}|${travelClass}|${quota}|${scenarioKey}`));
  const roll = rng();

  let kind: Availability["kind"];
  let count: number;
  if (quota === "TQ") {
    // Tatkal scarcity is structural (dossier-A quantified section).
    kind = roll < 0.18 ? "AVAILABLE" : roll < 0.38 ? "RAC" : "WL";
    count = kind === "AVAILABLE" ? Math.floor(rng() * 12) + 1
          : kind === "RAC" ? Math.floor(rng() * 20) + 1
          : Math.floor(rng() * 40) + 5;
  } else {
    kind = roll < 0.42 ? "AVAILABLE" : roll < 0.55 ? "RAC" : "WL";
    count = kind === "AVAILABLE" ? Math.floor(rng() * 80) + 2
          : kind === "RAC" ? Math.floor(rng() * 25) + 1
          : Math.floor(rng() * 60) + 3;
  }

  return {
    trainNumber, journeyDate, travelClass, quota, kind, count,
    autoRefundIfNot: kind !== "AVAILABLE",
  };
}

export function findTrain(number: string): TrainSummary | undefined {
  return TRAINS_ALL.find(x => x.number === number);
}
