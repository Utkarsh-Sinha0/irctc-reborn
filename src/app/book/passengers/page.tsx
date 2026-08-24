/* G1-WHY: passengers route wrapper (M12) — passes full journey context through (audit-2 F1/F3).
   G2-BEST: server page resolves persona; session cookie remains identity source of truth.
   G3-FUTURE: S. */
import PassengerPicker from "@/app/components/PassengerPicker";
import type { PersonaId } from "@/fixtures/passengers";

export default async function PassengersPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const valid: PersonaId[] = ["priya", "sharmaji", "fatima"];
  const persona = (valid.includes(sp.persona as PersonaId) ? sp.persona : "priya") as PersonaId;
  return (
    <PassengerPicker
      persona={persona}
      train={sp.train}
      cls={sp.cls}
      date={sp.date}
      quota={sp.quota}
      scenario={sp.scenario}
    />
  );
}
