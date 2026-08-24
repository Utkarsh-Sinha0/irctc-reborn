/* G1-WHY: pay route wrapper (M18/M19) — forwards scenario + context (audit-2 F1);
   adds back-link target info. G2-BEST: server page; theater is the only island.
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
      train={sp.train}
      date={sp.date}
    />
  );
}
