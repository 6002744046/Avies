import { redirect } from "next/navigation";
import { OrdersPage } from "@/components/orders/orders-page";
import { PageShell } from "@/components/ui/page-shell";
import { getCurrentUser } from "@/lib/auth";

export default async function Orders() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/orders");
  }

  return (
    <PageShell light>
      <OrdersPage />
    </PageShell>
  );
}
