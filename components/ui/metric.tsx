import type { ReactNode } from "react";
import { clsx } from "clsx";

export function Metric({
  label,
  value,
  tone = "aqua",
  icon
}: {
  label: string;
  value: string;
  tone?: "aqua" | "coral" | "saffron" | "leaf";
  icon?: ReactNode;
}) {
  const toneMap = {
    aqua: "text-aqua bg-aqua/10 border-aqua/20",
    coral: "text-coral bg-coral/10 border-coral/20",
    saffron: "text-saffron bg-saffron/10 border-saffron/20",
    leaf: "text-leaf bg-leaf/10 border-leaf/20"
  };

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-4 shadow-sm">
      <div
        className={clsx(
          "mb-4 grid size-10 place-items-center rounded-2xl border",
          toneMap[tone]
        )}
      >
        {icon}
      </div>
      <p className="text-2xl font-black text-ink">{value}</p>
      <p className="mt-1 text-sm text-ink/60">{label}</p>
    </div>
  );
}
