import type { ReactNode } from "react";
import { MainNav } from "./nav";

export function PageShell({
  children,
  light = false
}: {
  children: ReactNode;
  light?: boolean;
}) {
  return (
    <main className={light ? "min-h-screen bg-mist text-ink" : "min-h-screen bg-ink text-white"}>
      <MainNav />
      <div className="pt-16">{children}</div>
    </main>
  );
}
