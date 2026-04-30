import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "dark";
  href?: string;
  children: ReactNode;
};

const variants = {
  primary:
    "bg-ink text-white shadow-glow hover:-translate-y-0.5 hover:bg-[#101b2f]",
  secondary:
    "border border-white/20 bg-white/10 text-white backdrop-blur hover:-translate-y-0.5 hover:bg-white/20",
  ghost:
    "border border-ink/10 bg-white/70 text-ink hover:-translate-y-0.5 hover:bg-white",
  dark: "border border-white/10 bg-night text-white hover:-translate-y-0.5"
};

export function Button({
  className,
  variant = "primary",
  href,
  children,
  ...props
}: ButtonProps) {
  const classes = clsx(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-aqua/60 disabled:cursor-not-allowed disabled:opacity-55",
    variants[variant],
    className
  );

  if (href) {
    return (
      <Link className={classes} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
