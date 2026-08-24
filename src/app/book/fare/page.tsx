/* G1-WHY: fare route wrapper (M14/M15).
   G2-BEST: server page parses query; island renders engine outputs.
   G3-FUTURE: S. */
import FareSheet from "@/app/components/FareSheet";

export default async function FarePage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const ids = (sp.ids ?? "").split(",").filter(Boolean);
  return (
    <FareSheet
      persona={sp.persona ?? "priya"}
      ids={ids}
      idempotencyKey={sp.key ?? crypto.randomUUID()}
    />
  );
}
