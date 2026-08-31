import { Trophy } from "lucide-react";
import type { SeasonChampions, Team } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { TeamLogo } from "@/components/team-logo";
import { CoverImage } from "@/components/cover-image";
import { resolveTeamName } from "@/lib/teams";
import { cn } from "@/lib/utils";

/**
 * One season's championship results: AFC + NFC champions and the Super Bowl.
 * `featured` gives the marquee (usually most recent decided) season more room.
 */
export function ChampionCard({
  season,
  teams,
  featured = false,
  genericImageUrl,
}: {
  season: SeasonChampions;
  teams: Team[];
  featured?: boolean;
  genericImageUrl?: string;
}) {
  const sbWinner = season.superBowl?.winner;
  const sbTeam = resolveTeamName(sbWinner, teams);
  const accent = sbTeam?.primaryColor ?? "#9E7C0C";

  return (
    <div className="relative h-full overflow-hidden rounded-xl border border-white/10 bg-navy-800 shadow-card">
      {season.imageUrl || genericImageUrl ? (
        <CoverImage
          src={season.imageUrl}
          fallbackSrc={genericImageUrl}
          alt={`${season.year} champions`}
          className={cn("w-full", featured ? "aspect-[16/9]" : "aspect-[16/7]")}
          sizes="(max-width: 768px) 100vw, 400px"
        />
      ) : (
        <div className="h-1.5 w-full" style={{ backgroundColor: accent }} />
      )}
      <div className={cn("p-4 sm:p-5", featured && "sm:p-7")}>
        <div className="flex items-center justify-between">
          <span className="font-display text-sm font-bold uppercase tracking-wide text-slate-400">
            {season.year} Season
          </span>
          {season.decided ? (
            <Badge variant="accent">Champion</Badge>
          ) : (
            <Badge variant="live">Undecided</Badge>
          )}
        </div>

        {season.decided ? (
          <div className="mt-4 flex items-center gap-3">
            {sbTeam && <TeamLogo team={sbTeam} size={featured ? 56 : 44} />}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-amber-400">
                <Trophy className={cn("h-4 w-4", featured && "h-5 w-5")} />
                <span className="text-[11px] font-bold uppercase tracking-[0.14em]">
                  Super Bowl {season.year}
                </span>
              </div>
              <p
                className={cn(
                  "font-display font-extrabold leading-tight tracking-tight text-slate-50",
                  featured ? "text-2xl" : "text-lg",
                )}
              >
                {sbTeam ? `${sbTeam.city} ${sbTeam.name}` : sbWinner}
              </p>
            </div>
          </div>
        ) : (
          <p className="mt-4 font-display text-lg font-bold text-slate-300">
            Super Bowl {season.year} — still to be played.
          </p>
        )}

        <div className="mt-4 space-y-1.5 border-t border-white/10 pt-3 text-sm">
          <ConferenceLine label="AFC" winner={season.afc?.winner} teams={teams} />
          <ConferenceLine label="NFC" winner={season.nfc?.winner} teams={teams} />
        </div>

        {featured && season.superBowl?.description && (
          <p className="mt-4 border-t border-white/10 pt-3 text-sm leading-relaxed text-slate-400">
            {season.superBowl.description}
          </p>
        )}
      </div>
    </div>
  );
}

function ConferenceLine({
  label,
  winner,
  teams,
}: {
  label: string;
  winner?: string;
  teams: Team[];
}) {
  const team = resolveTeamName(winner, teams);
  return (
    <div className="flex items-center justify-between text-slate-400">
      <span>{label} Champion</span>
      <span className="flex items-center gap-1.5 font-semibold text-slate-300">
        {team && <TeamLogo team={team} size={16} />}
        {winner ? (team ? `${team.name}` : winner) : "TBD"}
      </span>
    </div>
  );
}
