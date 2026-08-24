/**
 * G1-WHY: E2 CancelMatrix2026 — powers M15 cancel-slider + RefundFSM; the April-2026
 * revision is the most confusion-heavy rule change (dossier-A P2) so our calculator
 * must be exact. This is the single source of truth for refund math.
 * G2-BEST: pure functions + table-driven constants; boundary tests pin 72/24/8h edges.
 * Rejected: date-fns duration helpers (trivial here, dep weight); class-based rules.
 * G3-FUTURE: blast-radius L→M (fare-sheet M14 renders its output). If IRCTC revises
 * windows again, only WINDOWS/FLAT below change — UI untouched.
 */
import type { TravelClass } from "@/lib/types";

/** Flat per-passenger charges (+GST) — unchanged by the Apr-2026 revision (dossier-A). */
export const FLAT_CANCEL_Paise: Record<TravelClass, number> = {
  "1A": 24000,
  EC: 24000,
  "2A": 20000,
  CC: 18000,
  "3A": 18000,
  "3E": 18000,
  SL: 12000,
  "2S": 6000,
};

/**
 * Confirmed-ticket cancellation windows per the revision effective Apr 1–15, 2026
 * (verified: official IRCTC PDF via TOI/HT/BusinessToday — dossier-A §P2):
 *   >72h: flat charge only · 72–24h: 25% · 24–8h: 50% · <8h: no refund.
 */
export type CancelWindow = "FLAT_ONLY" | "PC_25" | "PC_50" | "NONE";

export function windowFor(hoursBeforeDeparture: number): CancelWindow {
  if (hoursBeforeDeparture > 72) return "FLAT_ONLY";
  if (hoursBeforeDeparture > 24) return "PC_25";
  if (hoursBeforeDeparture >= 8) return "PC_50";
  return "NONE";
}

const WINDOW_PCT: Record<Exclude<CancelWindow, "FLAT_ONLY" | "NONE">, number> = {
  PC_25: 0.25,
  PC_50: 0.5,
};

export interface RefundInput {
  totalFarePaise: number;
  travelClass: TravelClass;
  hoursBeforeDeparture: number;
  passengersCount: number;
  /** WL tickets: ₹20+GST/passenger if cancelled ≥4h before departure (pre-revision figure — reverify before demo day, flagged in dossier-A) */
  status?: "CONFIRMED" | "WAITLISTED" | "RAC";
}

export interface RefundQuoteResult {
  window: CancelWindow;
  deductionPaise: number;
  refundPaise: number;
  note: string;
  noteHi?: string;
}

export function refundQuote(inp: RefundInput): RefundQuoteResult {
  const { totalFarePaise, travelClass, hoursBeforeDeparture, passengersCount, status = "CONFIRMED" } = inp;

  if (status === "WAITLISTED") {
    if (hoursBeforeDeparture < 4) {
      return { window: "NONE", deductionPaise: totalFarePaise, refundPaise: 0,
        note: "No refund on waitlisted cancellation within 4 hours of departure." };
    }
    const fee = 2000 * passengersCount; // ₹20 paise*100
    return { window: "FLAT_ONLY", deductionPaise: fee,
      refundPaise: Math.max(0, totalFarePaise - fee),
      note: "Waitlist cancellation: flat fee per passenger." };
  }

  const w = windowFor(hoursBeforeDeparture);
  if (w === "NONE") {
    return { window: w, deductionPaise: totalFarePaise, refundPaise: 0,
      note: "Confirmed tickets cancelled under 8 hours before departure get no refund (Apr 2026 rules)." ,
      noteHi: "नियत समय से 8 घंटे के भीतर रद्दीकरण पर धनवापसी नहीं।"};
  }
  if (w === "FLAT_ONLY") {
    const flat = FLAT_CANCEL_Paise[travelClass] * passengersCount;
    return { window: w, deductionPaise: flat,
      refundPaise: Math.max(0, totalFarePaise - flat),
      note: "More than 72 hours left: only the flat class charge applies.",
      noteHi: "72 घंटे से अधिक समय शेष: केवल निश्चित शुल्क लगता है।" };
  }
  const pctDeduction = Math.round(totalFarePaise * WINDOW_PCT[w]);
  const flatMin = FLAT_CANCEL_Paise[travelClass] * passengersCount;
  const deduction = Math.max(pctDeduction, flatMin);
  return { window: w, deductionPaise: deduction,
    refundPaise: Math.max(0, totalFarePaise - deduction),
    note: w === "PC_25"
      ? "Between 72 and 24 hours of departure: 25% of fare (min. flat charge)."
      : "Between 24 and 8 hours of departure: 50% of fare (min. flat charge).",
    noteHi: w === "PC_25"
      ? "प्रस्थान से 72–24 घंटे: किराया का 25% कटेगा।"
      : "प्रस्थान से 24–8 घंटे: किराया का 50% कटेगा।" };
}
