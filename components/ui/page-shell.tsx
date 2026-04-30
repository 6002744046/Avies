import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth";
import { MainNav } from "./nav";

export async function PageShell({
  children,
  light = false
}: {
  children: ReactNode;
  light?: boolean;
}) {
  const user = await getCurrentUser();

  return (
    <main className={light ? "min-h-screen bg-mist text-ink" : "min-h-screen bg-ink text-white"}>
      <MainNav user={user} />
      <div className="pt-16">{children}</div>
    </main>
  );
}
