import type { ReactNode } from "react";
import { clsx } from "clsx";

export function Card({
  children,
  className,
  light = false
}: {
  children: ReactNode;
  className?: string;
  light?: boolean;
}) {
  return (
    <div className={clsx("rounded-2xl p-5", light ? "light-glass text-ink" : "glass", className)}>
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  copy,
  dark = false
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  dark?: boolean;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className={clsx("text-xs font-bold uppercase", dark ? "text-aqua" : "text-coral")}>
        {eyebrow}
      </p>
      <h2 className={clsx("mt-3 text-3xl font-bold md:text-5xl", dark ? "text-white" : "text-ink")}>
        {title}
      </h2>
      {copy ? (
        <p className={clsx("mt-4 text-base leading-7", dark ? "text-white/70" : "text-ink/60")}>
          {copy}
        </p>
      ) : null}
    </div>
  );
}
