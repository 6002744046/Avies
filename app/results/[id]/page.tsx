import { ResultView } from "@/components/analysis/result-view";
import { PageShell } from "@/components/ui/page-shell";

export default async function ResultPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <PageShell light>
      <ResultView id={id} />
    </PageShell>
  );
}
