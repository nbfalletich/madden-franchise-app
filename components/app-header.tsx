"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield } from "lucide-react";
import { NAV_ITEMS } from "@/components/nav-items";
import { cn } from "@/lib/utils";

/**
 * Sticky top bar. Full nav on desktop; on mobile it's just brand + season chip
 * (primary navigation there lives in <MobileBottomNav />).
 */
export function AppHeader({
  seasonLabel,
}: {
  seasonLabel: string;
}) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-navy-950/90 backdrop-blur supports-[backdrop-filter]:bg-navy-950/75">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 md:h-16 md:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-amber-400 text-navy-950">
            <Shield className="h-5 w-5" />
          </span>
          <span className="font-display text-sm font-extrabold uppercase leading-none tracking-[0.14em] text-slate-50 sm:text-base">
            Madden
            <span className="block text-[10px] font-semibold tracking-[0.2em] text-amber-400 sm:text-xs">
              Franchise Hub
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                  active
                    ? "bg-white/10 text-slate-50"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <span className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300">
          {seasonLabel}
        </span>
      </div>
    </header>
  );
}
