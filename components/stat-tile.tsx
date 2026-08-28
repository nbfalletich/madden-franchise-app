import { cn } from "@/lib/utils";

/**
 * Small label / value tile. Used for career totals and "up for grabs" markers.
 */
export function StatTile({
  label,
  value,
  detail,
  muted = false,
  className,
}: {
  label: string;
  value: string;
  detail?: string;
  muted?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-navy-800 p-4 shadow-card",
        className,
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-400">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 font-display text-2xl font-extrabold tabular-nums tracking-tight",
          muted ? "text-slate-500" : "text-slate-50",
        )}
      >
        {value}
      </p>
      {detail && <p className="mt-1 text-[11px] text-slate-500">{detail}</p>}
    </div>
  );
}
