/* G1-WHY: ticket route wrapper (M20/M21).
   G2-BEST: server page passes params; celebration is client island.
   G3-FUTURE: S. */
import TicketCelebration from "@/app/components/TicketCelebration";

export default async function TicketPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  return (
    <TicketCelebration
      persona={sp.persona ?? "priya"}
      idempotencyKey={sp.key ?? crypto.randomUUID()}
      ids={(sp.ids ?? "").split(",").filter(Boolean)}
    />
  );
}
