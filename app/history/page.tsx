import type { Metadata } from "next";
import { Award, BookMarked, ScrollText, Star } from "lucide-react";
import {
  getAwardsBySeason,
  getCoaches,
  getHallOfFame,
  getLeagueStatus,
  getLore,
  getRecords,
  getSeasonChampions,
  getTeams,
} from "@/lib/data/leagueData";
import { HistoryNav } from "@/components/history-nav";
import { CoverImage } from "@/components/cover-image";
import { SectionHeader } from "@/components/section-header";
import { ChampionCard } from "@/components/champion-card";
import { AwardList } from "@/components/award-list";
import { RecordCard } from "@/components/record-card";
import { LoreCard } from "@/components/lore-card";
import { CareerTable } from "@/components/career-table";
import { EmptyState } from "@/components/empty-state";

export const metadata: Metadata = {
  title: "League History",
  description:
    "Champions, awards, the record book, league lore, and coach careers.",
};

export const revalidate = 300;

export default async function HistoryPage() {
  const [status, champions, awards, hof, records, lore, coaches, teams] =
    await Promise.all([
      getLeagueStatus(),
      getSeasonChampions(),
      getAwardsBySeason(),
      getHallOfFame(),
      getRecords(),
      getLore(),
      getCoaches(),
      getTeams(),
    ]);

  const decidedChampions = champions.filter((c) => c.decided);
  const [featuredSeason, ...restSeasons] =
    decidedChampions.length > 0 ? decidedChampions : champions;

  return (
    <div className="animate-fade-in">
      <header className="mb-2">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-400">
          Est. {status.firstYear} · Season {status.seasonNumber}
        </p>
        <h1 className="font-display text-4xl font-extrabold uppercase tracking-tight text-slate-50 sm:text-5xl">
          League History
        </h1>
        <p className="mt-1 text-slate-400">
          The permanent record. Most of it is still being written.
        </p>
      </header>

      <HistoryNav />

      {/* ---------------- Champions ---------------- */}
      <section id="champions" className="scroll-mt-28 pb-12">
        <SectionHeader eyebrow="Hall of Champions" title="Champions" />
        {champions.length === 0 ? (
          <EmptyState
            icon={Star}
            title="No champions crowned yet"
            description="The CHAMPIONS tab fills in as playoff rounds are decided."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredSeason && (
              <div className="sm:col-span-2 sm:row-span-2 lg:col-span-1">
                <ChampionCard
                  season={featuredSeason}
                  teams={teams}
                  featured
                />
              </div>
            )}
            {restSeasons.map((season) => (
              <ChampionCard
                key={season.year}
                season={season}
                teams={teams}
              />
            ))}
          </div>
        )}
      </section>

      {/* ---------------- Awards ---------------- */}
      <section id="awards" className="scroll-mt-28 pb-12">
        <SectionHeader eyebrow="Honors" title="Awards" />
        {awards.length === 0 ? (
          <EmptyState
            icon={Award}
            title="No awards yet"
            description="MVP, Coach of the Year, DPOY and SB MVP land here each season."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {awards.map((season) => (
              <AwardList key={season.year} season={season} />
            ))}
          </div>
        )}
      </section>

      {/* ---------------- Hall of Fame ---------------- */}
      <section id="hall-of-fame" className="scroll-mt-28 pb-12">
        <SectionHeader eyebrow="Immortals" title="Hall of Fame" />
        {hof.length === 0 ? (
          <EmptyState
            icon={Star}
            title="The Hall is empty"
            description="Inductees from the HALL_OF_FAME tab will be enshrined here."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {hof.map((person) => (
              <div
                key={`${person.name}-${person.inductionYear}`}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-navy-800 p-4 shadow-card"
              >
                {person.imageUrl && (
                  <CoverImage
                    src={person.imageUrl}
                    alt={person.name}
                    className="aspect-square h-12 w-12 shrink-0 rounded-full"
                    sizes="48px"
                  />
                )}
                <span className="min-w-0 flex-1 truncate font-display text-base font-bold text-slate-50">
                  {person.name}
                </span>
                <span className="font-display text-sm font-bold tabular-nums text-amber-400">
                  {person.inductionYear || "—"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ---------------- Record Book ---------------- */}
      <section id="records" className="scroll-mt-28 pb-12">
        <SectionHeader eyebrow="The Book" title="Record Book" />
        {records.length === 0 ? (
          <EmptyState
            icon={BookMarked}
            title="No records set yet"
            description="Single-game and season records from the L_RECORDS tab will be listed here."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {records.map((record) => (
              <RecordCard key={record.id} record={record} />
            ))}
          </div>
        )}
      </section>

      {/* ---------------- League Lore ---------------- */}
      <section id="lore" className="scroll-mt-28 pb-12">
        <SectionHeader eyebrow="Oral history" title="League Lore" />
        {lore.length === 0 ? (
          <EmptyState
            icon={ScrollText}
            title="No lore logged yet"
            description="Outer-league and intra-league moments from L_EVENTS appear on this timeline."
          />
        ) : (
          <ol className="relative space-y-3 border-l border-white/10 pl-4">
            {lore.map((event) => (
              <li key={event.id} className="relative">
                <span className="absolute -left-[1.30rem] top-5 h-2.5 w-2.5 rounded-full border-2 border-navy-900 bg-amber-400" />
                <LoreCard event={event} />
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* ---------------- Coach Careers ---------------- */}
      <section id="careers" className="scroll-mt-28 pb-4">
        <SectionHeader
          eyebrow="All-time"
          title="Coach Careers"
          action={{ label: "Full breakdown", href: "/coaches" }}
        />
        <CareerTable coaches={coaches} teams={teams} />
      </section>
    </div>
  );
}
