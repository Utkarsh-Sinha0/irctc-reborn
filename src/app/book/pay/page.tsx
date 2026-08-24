/* G1-WHY: pay route wrapper (M18/M19).
   G2-BEST: server page passes params; theater is the only client island.
   G3-FUTURE: S. */
import PayTheater from "@/app/components/PayTheater";

export default async function PayPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  return (
    <PayTheater
      persona={sp.persona ?? "priya"}
      idempotencyKey={sp.key ?? crypto.randomUUID()}
      method={sp.method ?? "IPAY"}
      ids={(sp.ids ?? "").split(",").filter(Boolean)}
      scenario={sp.scenario ?? "clean"}
    />
  );
}
