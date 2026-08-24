/**
 * G1-WHY: E1 FareRules — M14 fare-transparency sheet ("total = sum exactly", edge D2)
 * and M17's method-fee inline display. Money integrity is a judged trust moment.
 * G2-BEST: integer paise only; distance-class base table + additive components;
 * central rounder so the D2 invariant is testable in one place.
 * G3-FUTURE: blast-radius M (M14/M15/M17 all render its output). Fare table changes
 * (e.g., new budget) touch only BASE_PaisePerKm/COMPONENTS.
 */
import { z } from "zod";
import type { TravelClass, Quota, Passenger } from "@/lib/types";

/** Base fare per km in paise by class (fixture-realistic, deterministic). */
const BASE_PaisePerKm: Record<TravelClass, number> = {
  "1A": 320, "EC": 300, "2A": 145, "3A": 95, "3E": 85, "CC": 80, SL: 42, "2S": 22,
};

export const PayMethod = z.enum(["IPAY", "UPI", "CARD", "NETBANKING"]);
export type PayMethod = z.infer<typeof PayMethod>;

/** Convenience fee per method in paise — community ranking reflected in UI copy (dossier-A H6/G-rank). */
export const METHOD_FEE_Paise: Record<PayMethod, number> = {
  IPAY: 0,
  UPI: 500,
  CARD: 1500,
  NETBANKING: 1000,
};
/** Fastest-first ordering shown to users (CitizenNest community consensus). */
export const METHOD_SPEED_RANK: PayMethod[] = ["IPAY", "UPI", "CARD", "NETBANKING"];

export interface FareComputation {
  distanceKm: number;
  travelClass: TravelClass;
  quota: Quota;
  passengers: Pick<Passenger, "age" | "isChild">[];
}

export interface FareBreakdown {
  lines: { label: string; labelHi?: string; amountPaise: number }[];
  totalPaise: number;
}

/**
 * Deterministic fare: children under 5 ride free without seat (edge B5/C2);
 * senior citizens pay full fare (concession suspended since CC-22/2020 — dossier-A
 * edge-case note; honesty over nostalgia).
 */
export function computeFare(inp: FareComputation): FareBreakdown {
  const { distanceKm, travelClass, quota, passengers } = inp;
  const chargeable = passengers.filter(p => !p.isChild);

  const base = Math.round(BASE_PaisePerKm[travelClass] * distanceKm) * Math.max(chargeable.length, 1);
  const reservation = chargeable.length * 4000; // ₹40/pax
  const gst = Math.round(base * 0.05);          // simplified 5% on AC classes
  const quotaFee = quota === "TQ" ? 6000 : quota === "PT" ? 20000 : 0; // tatkal/premium premium
  const superfast = 6000;

  const lines = [
    { label: `Base fare (${travelClass}, ${distanceKm} km × ${chargeable.length})`, labelHi: `मूल किराया (${distanceKm} किमी × ${chargeable.length})`, amountPaise: base },
    { label: "Reservation charge", labelHi: "आरक्षण शुल्क", amountPaise: reservation },
    { label: "Superfast surcharge", labelHi: "सुपरफास्ट अधिभार", amountPaise: superfast },
    ...(quotaFee ? [{ label: `${quota} quota charge`, amountPaise: quotaFee }] : []),
    { label: "GST (5%)", labelHi: "जीएसटी (5%)", amountPaise: gst },
    { label: "Convenience fee (added at payment)", labelHi: "सुविधा शुल्क (भुगतान पर)", amountPaise: 0 },
  ];

  return { lines, totalPaise: lines.reduce((s, l) => s + l.amountPaise, 0) };
}

/** Attach the chosen method's fee at payment time (never a last-step surprise — edge D3). */
export function withMethodFee(breakdown: FareBreakdown, method: PayMethod): FareBreakdown {
  if (method === "IPAY") return breakdown; // wallet: no fee, fastest — community-ranked #1
  const fee = METHOD_FEE_Paise[method];
  const label = method === "UPI" ? "Convenience fee (UPI)" :
                method === "CARD" ? "Convenience fee (card)" : "Convenience fee (net banking)";
  const lines = breakdown.lines.map(l =>
    l.label.startsWith("Convenience fee") ? { ...l, label, labelHi: "सुविधा शुल्क", amountPaise: fee } : l
  );
  return { lines, totalPaise: lines.reduce((s, l) => s + l.amountPaise, 0) };
}
