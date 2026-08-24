/* G1-WHY: /book/new route hosting SearchForm (M07–M09 entry).
   G2-BEST: server page passes quota param; form is the only client island.
   G3-FUTURE: S. */
import SearchForm from "@/app/components/SearchForm";

export default async function BookNew({ searchParams }: { searchParams: Promise<{ quota?: string }> }) {
  const { quota } = await searchParams;
  return <SearchForm initialQuota={quota === "TQ" ? "TQ" : "GN"} />;
}
