import { AnalysisWizard } from "@/components/analysis/analysis-wizard";
import { PageShell } from "@/components/ui/page-shell";

export default function AnalysisPage() {
  return (
    <PageShell>
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <AnalysisWizard />
      </section>
    </PageShell>
  );
}
