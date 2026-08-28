import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trophy } from "lucide-react";
import { getCoach, getCoaches, getTeams } from "@/lib/data/leagueData";
import { Avatar } from "@/components/ui/avatar";
import { TeamLogo } from "@/components/team-logo";
import { StatTile } from "@/components/stat-tile";
import { EmptyState } from "@/components/empty-state";
import { resolveTeamName } from "@/lib/teams";
import { recordString } from "@/lib/utils";

export const revalidate = 300;

export async function generateStaticParams() {
  const coaches = await getCoaches();
  return coaches.map((c) => ({ user: c.user.toLowerCase() }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ user: string }>;
}): Promise<Metadata> {
  const { user } = await params;
  const coach = await getCoach(user);
  return { title: coach ? `${coach.displayName} — Career` : "Coach not found" };
}

export default async function CoachCareerPage({
  params,
}: {
  params: Promise<{ user: string }>;
}) {
  const { user } = await params;
  const [coach, teams] = await Promise.all([getCoach(user), getTeams()]);
  if (!coach) notFound();

  const team = teams.find((t) => t.id === coach.teamId);
  const games = coach.careerWins + coach.careerLosses + coach.careerTies;
  const winPct =
    games === 0
      ? "—"
      : ((coach.careerWins + coach.careerTies * 0.5) / games)
          .toFixed(3)
          .replace(/^0/, "");

  return (
    <div className="animate-fade-in">
      <Link
        href="/coaches"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 transition-colors hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" />
        All coaches
      </Link>

      <header className="mb-6 flex items-center gap-4">
        {team ? (
          <TeamLogo team={team} size={64} />
        ) : (
          <Avatar name={coach.displayName} color={coach.avatarColor} size={64} />
        )}
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-50">
            {coach.displayName}
          </h1>
          <p className="text-slate-400">
            {team ? `${team.city} ${team.name}` : "Unassigned"}
            {coach.coachName ? ` · ${coach.coachName}` : ""}
          </p>
        </div>
      </header>

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Career Record"
          value={
            games === 0
              ? "0-0"
              : recordString(
                  coach.careerWins,
                  coach.careerLosses,
                  coach.careerTies,
                )
          }
          muted={games === 0}
        />
        <StatTile label="Win %" value={winPct} muted={games === 0} />
        <StatTile
          label="Playoff Trips"
          value={String(coach.playoffAppearances)}
          muted={coach.playoffAppearances === 0}
        />
        <StatTile
          label="Championships"
          value={String(coach.championships)}
          muted={coach.championships === 0}
        />
      </div>

      <h2 className="mb-3 font-display text-xl font-bold tracking-tight text-slate-50">
        Season by Season
      </h2>

      {coach.seasons.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No seasons recorded"
          description="Rows in L_CAREERS for this coach will populate the table."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/10 bg-navy-800 shadow-card">
          <div className="grid grid-cols-[0.7fr_1fr_0.8fr_1.5fr] gap-2 border-b border-white/10 bg-white/5 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
            <span>Year</span>
            <span>Team</span>
            <span className="text-right">Record</span>
            <span className="text-right">Result</span>
          </div>
          <div className="divide-y divide-white/5">
            {coach.seasons.map((season) => {
              const sTeam =
                resolveTeamName(season.team, teams) ??
                (season.teamId
                  ? teams.find((t) => t.id === season.teamId)
                  : undefined);
              const played = season.wins + season.losses + season.ties > 0;
              return (
                <div
                  key={season.year}
                  className="grid grid-cols-[0.7fr_1fr_0.8fr_1.5fr] items-center gap-2 px-3 py-3"
                >
                  <span className="font-display text-sm font-bold tabular-nums text-slate-200">
                    {season.year}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-slate-300">
                    {sTeam ? (
                      <>
                        <TeamLogo team={sTeam} size={16} />
                        {sTeam.abbreviation}
                      </>
                    ) : (
                      "—"
                    )}
                  </span>
                  <span className="text-right font-display text-sm font-bold tabular-nums text-slate-200">
                    {played
                      ? recordString(season.wins, season.losses, season.ties)
                      : "—"}
                  </span>
                  <span className="truncate text-right text-sm text-slate-400">
                    {season.result || (played ? "Regular season" : "Upcoming")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
