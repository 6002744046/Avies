import Link from "next/link";
import {
  Activity,
  CreditCard,
  LayoutDashboard,
  LockKeyhole,
  Package,
  Sparkles,
  ShieldCheck,
  ShoppingBag
} from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import type { AuthUser } from "@/lib/auth";

const links = [
  { href: "/analysis", label: "Analysis", icon: Activity },
  { href: "/pricing", label: "Pricing", icon: CreditCard },
  { href: "/product", label: "Kit", icon: Package },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/orders", label: "Orders", icon: ShoppingBag }
];

export function MainNav({ user }: { user: AuthUser | null }) {
  const visibleLinks =
    user?.role === "admin"
      ? [...links, { href: "/admin", label: "Admin", icon: ShieldCheck }]
      : links;

  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-ink/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-sm font-black text-white">
          <span className="grid size-9 place-items-center rounded-2xl border border-white/10 bg-white/10">
            <Sparkles className="size-4 text-aqua" />
          </span>
          Aviex
        </Link>
        <nav className="no-scrollbar flex max-w-[72vw] items-center gap-1 overflow-x-auto">
          {visibleLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex h-10 items-center gap-2 rounded-2xl px-3 text-xs font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <Icon className="size-4" />
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            );
          })}
          {user ? (
            <LogoutButton />
          ) : (
            <Link
              href="/login"
              className="inline-flex h-10 items-center gap-2 rounded-2xl px-3 text-xs font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <LockKeyhole className="size-4" />
              <span className="hidden sm:inline">Login</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
