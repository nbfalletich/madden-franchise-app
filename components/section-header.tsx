import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Standard section title used across pages. Optional right-aligned link.
 */
export function SectionHeader({
  title,
  eyebrow,
  action,
  className,
}: {
  title: string;
  eyebrow?: string;
  action?: { label: string; href: string };
  className?: string;
}) {
  return (
    <div className={cn("mb-3 flex items-end justify-between gap-3", className)}>
      <div>
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-400">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-xl font-bold tracking-tight text-slate-50 sm:text-2xl">
          {title}
        </h2>
      </div>
      {action && (
        <Link
          href={action.href}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-amber-400 transition-colors hover:text-amber-300"
        >
          {action.label}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
