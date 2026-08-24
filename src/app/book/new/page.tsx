/* G1-WHY: /book/new route hosting the One-Shot SearchForm (M07–M11 v2).
   G2-BEST: quota param kept in URL contract for old links; scenario passthrough.
   G3-FUTURE: S. */
import SearchForm from "@/app/components/SearchForm";

export default async function BookNew({ searchParams }: { searchParams: Promise<{ quota?: string; scenario?: string }> }) {
  const { quota, scenario } = await searchParams;
  return <SearchForm initialQuota={quota === "TQ" ? "TQ" : "GN"} scenario={scenario ?? "clean"} />;
}
