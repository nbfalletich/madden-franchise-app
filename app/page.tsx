import { Newspaper, ScrollText } from "lucide-react";
import { getAwardsBySeason, getHomeData, getTeams } from "@/lib/data/leagueData";
import { SeasonBanner } from "@/components/season-banner";
import { FeaturedStory } from "@/components/featured-story";
import { FeaturedEvent } from "@/components/featured-event";
import { SectionHeader } from "@/components/section-header";
import { CoachCard } from "@/components/coach-card";
import { NewsCard } from "@/components/news-card";
import { LoreCard } from "@/components/lore-card";
import { PersonalityCard } from "@/components/personality-card";
import { SocialPostCard } from "@/components/social-post-card";
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

  const {
    status,
    coaches,
    genericPhoto,
    currentChampions,
    latestLore,
    activePersonalities,
    featuredArticle,
    featuredLore,
    latestNews,
    latestSocial,
  } = home;
  const teamById = (id?: string) => teams.find((t) => t.id === id);
  const now = new Date().toISOString();

  const thisYearAwards = awardsBySeason.find((a) => a.year === status.year);
  const awardWinner = (name: string) =>
    thisYearAwards?.awards.find((a) => a.award.toUpperCase().includes(name))
      ?.winner;

  return (
    <div className="space-y-10 animate-fade-in">
      <SeasonBanner status={status} />

      {featuredArticle ? (
        <FeaturedStory
          article={featuredArticle}
          now={now}
          genericImageUrl={genericPhoto}
        />
      ) : featuredLore ? (
        <FeaturedEvent event={featuredLore} genericImageUrl={genericPhoto} />
      ) : (
        <EmptyState
          icon={ScrollText}
          title="The story starts here"
          description={`Season ${status.seasonNumber} is underway. A photo-backed story will headline this space as soon as one is tagged.`}
        />
      )}

      {latestNews.length > 0 && (
        <section>
          <SectionHeader
            eyebrow="Latest"
            title="Around the League"
            action={{ label: "All news", href: "/news" }}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {latestNews.map((article) => (
              <NewsCard
                key={article.slug}
                article={article}
                teams={teams}
                now={now}
                genericImageUrl={genericPhoto}
              />
            ))}
          </div>
        </section>
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
        <SectionHeader eyebrow={`${status.year} Season`} title="Up For Grabs" />
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

      {latestSocial.length > 0 && (
        <section>
          <SectionHeader
            eyebrow="The group chat"
            title="Recent Social Activity"
            action={{ label: "Open feed", href: "/social" }}
          />
          <div className="space-y-3">
            {latestSocial.map((post) => (
              <SocialPostCard
                key={post.id}
                post={post}
                now={now}
                team={teamById(post.teamId)}
                compact
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionHeader
          eyebrow="Oral history"
          title="League Lore"
          action={{ label: "Full archive", href: "/history#lore" }}
        />
        {latestLore.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {latestLore.map((event) => (
              <LoreCard
                key={event.id}
                event={event}
                genericImageUrl={genericPhoto}
              />
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

      {latestNews.length === 0 && (
        <section>
          <SectionHeader eyebrow="Coming soon" title="Newsroom" />
          <EmptyState
            icon={Newspaper}
            title="AI-generated recaps are on the way"
            description="Game stories and headlines publish here once there's league news to write about."
          />
        </section>
      )}
    </div>
  );
}
