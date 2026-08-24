/* G1-WHY: passengers route wrapper (M12).
   G2-BEST: server page resolves persona from query (demo simplification; session cookie
   remains source of truth for identity). G3-FUTURE: S. */

import PassengerPicker from "@/app/components/PassengerPicker";
import type { PersonaId } from "@/fixtures/passengers";

export default async function PassengersPage({ searchParams }: { searchParams: Promise<{ persona?: string }> }) {
  const { persona } = await searchParams;
  const valid: PersonaId[] = ["priya", "sharmaji", "fatima"];
  const p = (valid.includes(persona as PersonaId) ? persona : "priya") as PersonaId;
  return <PassengerPicker persona={p} />;
}
