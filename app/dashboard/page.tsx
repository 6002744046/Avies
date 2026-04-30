import { redirect } from "next/navigation";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { PageShell } from "@/components/ui/page-shell";
import { getCurrentUser } from "@/lib/auth";

export default async function Dashboard() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  return (
    <PageShell light>
      <DashboardPage />
    </PageShell>
  );
}
