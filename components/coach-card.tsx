import Link from "next/link";
import { Trophy } from "lucide-react";
import type { Coach, Team } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { TeamLogo } from "@/components/team-logo";
import { recordString } from "@/lib/utils";

/**
 * League member card: coach, team, career line. Links to the full career page.
 */
export function CoachCard({ coach, team }: { coach: Coach; team?: Team }) {
  const hasCareer =
    coach.careerWins + coach.careerLosses + coach.careerTies > 0;

  return (
    <Link
      href={`/coaches/${coach.user.toLowerCase()}`}
      className="group flex items-center gap-4 rounded-xl border border-white/10 bg-navy-800 p-4 shadow-card transition-colors hover:border-white/25"
    >
      {team ? (
        <TeamLogo team={team} size={48} />
      ) : (
        <Avatar name={coach.displayName} color={coach.avatarColor} size={48} />
      )}

      <div className="min-w-0 flex-1">
        <p className="font-display text-lg font-bold leading-tight tracking-tight text-slate-50">
          {coach.displayName}
        </p>
        <p className="truncate text-sm text-slate-400">
          {team ? `${team.city} ${team.name}` : "Unassigned"}
          {coach.coachName ? ` · ${coach.coachName}` : ""}
        </p>
        <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
          <span className="tabular-nums">
            {hasCareer
              ? `${recordString(coach.careerWins, coach.careerLosses, coach.careerTies)} career`
              : "New this season"}
          </span>
          {coach.championships > 0 && (
            <span className="inline-flex items-center gap-1 text-amber-400">
              <Trophy className="h-3.5 w-3.5" />
              {coach.championships}
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}
