import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Graceful placeholder for sections whose Google Sheet tab is still empty
 * (records, awards, hall of fame) or not built yet (news, social feed).
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-navy-800/50 px-6 py-10 text-center",
        className,
      )}
    >
      {Icon && (
        <span className="mb-3 grid h-11 w-11 place-items-center rounded-full bg-white/5 text-slate-400">
          <Icon className="h-5 w-5" />
        </span>
      )}
      <p className="font-display text-base font-bold tracking-tight text-slate-200">
        {title}
      </p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-slate-400">{description}</p>
      )}
    </div>
  );
}
