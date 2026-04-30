import { redirect } from "next/navigation";
import { AdminPage } from "@/components/admin/admin-page";
import { PageShell } from "@/components/ui/page-shell";
import { getCurrentUser } from "@/lib/auth";

export default async function Admin() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  if (user.role !== "admin") {
    redirect("/");
  }

  return (
    <PageShell light>
      <AdminPage />
    </PageShell>
  );
}
