import type { SeasonAwards } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Awards for one season (tab: AWARDS), grouped by year.
 */
export function AwardList({ season }: { season: SeasonAwards }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-navy-800 shadow-card">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-2">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-slate-200">
          {season.year} Awards
        </h3>
        {!season.decided && (
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
            Voting open
          </span>
        )}
      </div>
      <dl className="divide-y divide-white/5">
        {season.awards.map((award) => (
          <div
            key={award.award}
            className="flex items-center justify-between px-4 py-2.5"
          >
            <dt className="text-sm font-medium text-slate-400">{award.award}</dt>
            <dd
              className={cn(
                "text-sm font-bold",
                award.winner ? "text-slate-100" : "text-slate-600",
              )}
            >
              {award.winner || "TBD"}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
