import Link from "next/link";
import { Newspaper, ScrollText, Trophy } from "lucide-react";
import {
  getAwardsBySeason,
  getHomeData,
  getTeams,
} from "@/lib/data/leagueData";
import { SeasonBanner } from "@/components/season-banner";
import { FeaturedEvent } from "@/components/featured-event";
import { SectionHeader } from "@/components/section-header";
import { CoachCard } from "@/components/coach-card";
import { LoreCard } from "@/components/lore-card";
import { PersonalityCard } from "@/components/personality-card";
import { StatTile } from "@/components/stat-tile";
import { EmptyState } from "@/components/empty-state";

// Re-check the Google Sheet at most every 5 minutes.
export const revalidate = 300;

export default async function HomePage() {
  const [home, teams, awardsBySeason] = await Promise.all([
    getHomeData(),
    getTeams(),
    getAwardsBySeason(),
  ]);

  const { status, coaches, currentChampions, latestLore, activePersonalities } =
    home;
  const teamById = (id?: string) => teams.find((t) => t.id === id);

  const thisYearAwards = awardsBySeason.find((a) => a.year === status.year);
  const awardWinner = (name: string) =>
    thisYearAwards?.awards.find((a) =>
      a.award.toUpperCase().includes(name),
    )?.winner;

  return (
    <div className="space-y-10 animate-fade-in">
      <SeasonBanner status={status} />

      {latestLore[0] ? (
        <FeaturedEvent event={latestLore[0]} />
      ) : (
        <EmptyState
          icon={ScrollText}
          title="The story starts here"
          description={`Season ${status.seasonNumber} is underway. Headlines and lore will fill this space as it happens.`}
        />
      )}

      <section>
        <SectionHeader
          eyebrow="The League"
          title="Coaches"
          action={{ label: "Career records", href: "/coaches" }}
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {coaches.map((coach) => (
            <CoachCard
              key={coach.user}
              coach={coach}
              team={teamById(coach.teamId)}
            />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          eyebrow={`${status.year} Season`}
          title="Up For Grabs"
        />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile
            label="Super Bowl"
            value={currentChampions?.superBowl?.winner ?? "TBD"}
            muted={!currentChampions?.superBowl?.winner}
            detail={`${status.year} champion`}
          />
          <StatTile
            label="MVP"
            value={awardWinner("MVP") ?? "TBD"}
            muted={!awardWinner("MVP")}
          />
          <StatTile
            label="Coach of the Year"
            value={awardWinner("COACH") ?? "TBD"}
            muted={!awardWinner("COACH")}
          />
          <StatTile
            label="Def. Player of Year"
            value={awardWinner("DPOY") ?? "TBD"}
            muted={!awardWinner("DPOY")}
          />
        </div>
      </section>

      <section>
        <SectionHeader
          eyebrow="Oral history"
          title="League Lore"
          action={{ label: "Full archive", href: "/history#lore" }}
        />
        {latestLore.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {latestLore.map((event) => (
              <LoreCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={ScrollText}
            title="No lore logged yet"
            description="Add rows to the L_EVENTS tab — outer-league and intra-league moments both land here."
          />
        )}
      </section>

      <section>
        <SectionHeader
          eyebrow="The media"
          title="Talking Heads"
          action={{ label: "All accounts", href: "/social" }}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {activePersonalities.slice(0, 6).map((person) => (
            <PersonalityCard key={person.id} person={person} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader eyebrow="Coming soon" title="Newsroom" />
        <EmptyState
          icon={Newspaper}
          title="AI-generated recaps are on the way"
          description="Game stories, power rankings, and headlines will publish here once the season kicks off."
        />
        <div className="mt-3 flex justify-center">
          <Link
            href="/history"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-400 hover:text-amber-300"
          >
            <Trophy className="h-4 w-4" />
            Browse league history instead
          </Link>
        </div>
      </section>
    </div>
  );
}
