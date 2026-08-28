import Link from "next/link";
import { ArrowUpRight, Globe, Users } from "lucide-react";
import type { LeagueEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

const SCOPE_META: Record<
  LeagueEvent["scope"],
  { label: string; className: string; icon: typeof Globe }
> = {
  outer: {
    label: "Outer-League",
    className: "bg-sky-500/15 text-sky-300",
    icon: Globe,
  },
  intra: {
    label: "Intra-League",
    className: "bg-amber-500/15 text-amber-300",
    icon: Users,
  },
  other: {
    label: "Lore",
    className: "bg-white/10 text-slate-300",
    icon: Globe,
  },
};

/**
 * Timeline entry for a memorable moment in league history (tab: L_EVENTS).
 */
export function LoreCard({ event }: { event: LeagueEvent }) {
  const meta = SCOPE_META[event.scope];
  const Icon = meta.icon;

  return (
    <Link
      href={`/history/lore/${event.slug}`}
      className="group relative flex flex-col gap-2 rounded-xl border border-white/10 bg-navy-800 p-4 shadow-card transition-colors hover:border-white/25"
    >
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5",
            meta.className,
          )}
        >
          <Icon className="h-3 w-3" />
          {meta.label}
        </span>
        {event.year && <span className="text-slate-500">{event.year}</span>}
      </div>

      <h3 className="font-display text-lg font-bold leading-tight tracking-tight text-slate-50">
        {event.name}
      </h3>
      {event.description && (
        <p className="line-clamp-2 text-sm leading-relaxed text-slate-400">
          {event.description}
        </p>
      )}

      <ArrowUpRight className="absolute right-3 top-3 h-4 w-4 text-slate-600 transition-colors group-hover:text-amber-400" />
    </Link>
  );
}
