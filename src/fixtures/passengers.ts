/**
 * G1-WHY: F2 passenger fixtures — persona master lists power M12 prefill (the
 * "prefilled ✓✓✓" beat) and Elder-mode assisted booking. Collectivist household
 * reality from dossier-D (family-linked profiles).
 * G2-BEST: static typed lists keyed by persona; applyRules() centralizes age rules
 * (child <5 no-seat, berth-pref eligibility 60+/45+ per SS quota — dossier-A).
 * G3-FUTURE: blast-radius S. New personas = new entries; no engine changes.
 */
import type { Passenger } from "@/lib/types";

export type PersonaId = "priya" | "sharmaji" | "fatima";

const P = (
  id: string, name: string, age: number,
  gender: "M" | "F" | "X",
  berthPref: Passenger["berthPref"] = "NO_PREF"
): Passenger => ({
  id, name, age, gender, berthPref, isChild: age < 5, foodChoice: "NONE",
});

export const PERSONAS: Record<PersonaId, {
  name: string;
  tagline: string;
  taglineHi: string;
  home: string;
  masterList: Passenger[];
}> = {
  priya: {
    name: "Priya Deshmukh",
    tagline: "Tatkal sprinter · Pune ⇄ Delhi weekly",
    taglineHi: "तत्काल बुकिंग · पुणे ⇄ दिल्ली साप्ताहिक",
    home: "/home/priya",
    masterList: [
      P("px1", "Priya Deshmukh", 29, "F", "SIDE_LOWER"),
      P("px2", "Omkar Deshmukh", 33, "M"),
    ],
  },
  sharmaji: {
    name: "Ramesh Sharma",
    tagline: "Travels with Sunita · Ayodhya monthly",
    taglineHi: "सुनीता जी के साथ · अयोध्या मासिक",
    home: "/home/sharmaji",
    masterList: [
      P("sx1", "Ramesh Sharma", 67, "M", "LOWER"),
      P("sx2", "Sunita Sharma", 64, "F", "LOWER"),
    ],
  },
  fatima: {
    name: "Fatima Khan",
    tagline: "Books for the whole family",
    taglineHi: "पूरे परिवार के लिए बुकिंग",
    home: "/home/fatima",
    masterList: [
      P("fx1", "Fatima Khan", 41, "F", "LOWER"),
      P("fx2", "Imran Khan", 44, "M"),
      P("fx3", "Ayesha Khan", 14, "F"),
      P("fx4", "Zoya Khan", 9, "F"),
      P("fx5", "Baby Aarav", 4, "M"), // <5 → rides free, no seat (edge C2/B5)
      P("fx6", "Bibi Amna", 70, "F", "LOWER"),
    ],
  },
};

/** Age-rule application at booking time — single place so UI never embeds rules. */
export function applyRules(pax: Passenger[], journeyDateIso: string): Passenger[] {
  void journeyDateIso; // ages are as-on-booking in fixtures; journey-date aging is C2's test concern
  return pax.map(p => ({
    ...p,
    // SS-quota lower-berth eligibility surfaced automatically (60+ M / 45+ F)
    berthPref:
      p.berthPref === "NO_PREF" && ((p.gender === "M" && p.age >= 60) || (p.gender === "F" && p.age >= 45))
        ? "LOWER"
        : p.berthPref,
  }));
}
