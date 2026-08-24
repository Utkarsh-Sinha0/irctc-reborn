/* G1-WHY: /book/new route hosting SearchForm (M07–M09 entry).
   G2-BEST: server page passes quota AND scenario (audit-2 F1: scenario must survive hops).
   G3-FUTURE: S. */
import SearchForm from "@/app/components/SearchForm";

export default async function BookNew({ searchParams }: { searchParams: Promise<{ quota?: string; scenario?: string }> }) {
  const { quota, scenario } = await searchParams;
  return <SearchForm initialQuota={quota === "TQ" ? "TQ" : "GN"} scenario={scenario ?? "clean"} />;
}
