import { BadgeCheck } from "lucide-react";
import type { MediaPersonality } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/**
 * A media-universe account (tab: X_PERSONALITIES). These will drive the
 * AI-generated Social feed later; for now they render as the roster.
 */
export function PersonalityCard({ person }: { person: MediaPersonality }) {
  const yearRange = person.startYear
    ? `${person.startYear}–${person.endYear ?? "present"}`
    : undefined;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-white/10 bg-navy-800 p-3.5 shadow-card",
        !person.active && "opacity-55",
      )}
    >
      <Avatar name={person.name} color={person.avatarColor} size={42} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-bold text-slate-50">
            {person.name}
          </p>
          {person.active && (
            <BadgeCheck className="h-4 w-4 shrink-0 text-amber-400" />
          )}
        </div>
        <p className="truncate text-xs text-slate-500">
          @{person.username} · {person.role}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p
          className={cn(
            "text-[10px] font-bold uppercase tracking-wide",
            person.active ? "text-emerald-400" : "text-slate-500",
          )}
        >
          {person.active ? "Active" : "Inactive"}
        </p>
        {yearRange && (
          <p className="text-[11px] tabular-nums text-slate-600">{yearRange}</p>
        )}
      </div>
    </div>
  );
}
