import Link from "next/link";
import type { Coach, Team } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { TeamLogo } from "@/components/team-logo";
import { EmptyState } from "@/components/empty-state";
import { Trophy } from "lucide-react";
import { cn, recordString } from "@/lib/utils";

/**
 * Pro-Football-Reference-style career table for the three coaches.
 */
export function CareerTable({
  coaches,
  teams,
}: {
  coaches: Coach[];
  teams: Team[];
}) {
  if (coaches.length === 0) {
    return (
      <EmptyState
        icon={Trophy}
        title="No coaches yet"
        description="Add rows to the L_CAREERS tab and they'll show up here."
      />
    );
  }

  const teamById = (id?: string) => teams.find((t) => t.id === id);

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-navy-800 shadow-card">
      <div className="grid grid-cols-[1.6fr_0.9fr_0.7fr_0.6fr] gap-2 border-b border-white/10 bg-white/5 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
        <span>Coach</span>
        <span className="text-right">Career</span>
        <span className="text-right">Win%</span>
        <span className="text-right">Titles</span>
      </div>
      <div className="divide-y divide-white/5">
        {coaches.map((coach) => {
          const team = teamById(coach.teamId);
          const games =
            coach.careerWins + coach.careerLosses + coach.careerTies;
          const pct =
            games === 0
              ? "—"
              : (
                  (coach.careerWins + coach.careerTies * 0.5) /
                  games
                )
                  .toFixed(3)
                  .replace(/^0/, "");

          return (
            <Link
              key={coach.user}
              href={`/coaches/${coach.user.toLowerCase()}`}
              className="grid grid-cols-[1.6fr_0.9fr_0.7fr_0.6fr] items-center gap-2 px-3 py-3 transition-colors hover:bg-white/5"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                {team ? (
                  <TeamLogo team={team} size={30} />
                ) : (
                  <Avatar
                    name={coach.displayName}
                    color={coach.avatarColor}
                    size={30}
                  />
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-100">
                    {coach.displayName}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {team ? team.abbreviation : "—"} ·{" "}
                    {coach.seasonsPlayed} {coach.seasonsPlayed === 1 ? "yr" : "yrs"}
                  </p>
                </div>
              </div>

              <span className="text-right font-display text-sm font-bold tabular-nums text-slate-200">
                {games === 0
                  ? "0-0"
                  : recordString(
                      coach.careerWins,
                      coach.careerLosses,
                      coach.careerTies,
                    )}
              </span>
              <span className="text-right text-sm tabular-nums text-slate-400">
                {pct}
              </span>
              <span
                className={cn(
                  "text-right font-display text-sm font-bold tabular-nums",
                  coach.championships > 0 ? "text-amber-400" : "text-slate-500",
                )}
              >
                {coach.championships}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
