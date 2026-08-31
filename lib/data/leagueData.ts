/**
 * ============================================================================
 *  DATA LAYER — the only place the UI reads league data from.
 * ============================================================================
 *
 * Pages and components call the `get*` functions here. They never touch the
 * sheet parser or the raw rows directly.
 *
 * Source: `lib/data/sheets.ts#getRows(tab)` returns rows as objects keyed by the
 * Google Sheet column headers. When `SHEET_ID` is set those rows come live from
 * the workbook (revalidated every 5 min); otherwise from the committed snapshot
 * in `lib/data/seed.ts`.
 *
 * This file does three things per data source:
 *   1. map raw header-keyed rows -> typed interfaces (lib/types.ts)
 *   2. derive / aggregate (coach career totals, group champions by year, ...)
 *   3. resolve references (raw team text -> Team, coach -> current team)
 *
 * Adding a real column to a tab? Update the mapper here. Adding a whole new tab
 * (e.g. NEWS, X_POSTS)? Add it to `SheetTab` in seed.ts and give it a mapper.
 */

import { getRows, isLiveSource } from "./sheets";
import { getDriveMap, getGenericPhoto, photoFor } from "./drive";
import { NFL_TEAMS } from "./nflTeams";
import { resolveTeamName } from "@/lib/teams";
import generatedNews from "@/data/generated/news.json";
import generatedSocial from "@/data/generated/social.json";
import type {
  Award,
  Coach,
  CoachSeason,
  CoachSeasonRow,
  ChampionshipResult,
  HallOfFamer,
  LeagueEvent,
  LeaguePhase,
  LeagueRecord,
  LeagueStatus,
  MediaPersonality,
  NewsArticle,
  NewsCategory,
  SeasonAwards,
  SeasonChampions,
  SocialPost,
  Team,
} from "@/lib/types";
import {
  colorFromString,
  parseRecord,
  slugify,
  titleCase,
  toIntOrUndefined,
} from "@/lib/utils";

/** "live" when SHEET_ID is set (reading Google Sheets), "seed" otherwise. */
export function dataSource(): "live" | "seed" {
  return isLiveSource() ? "live" : "seed";
}
const FALLBACK_YEAR = 2027;

/* -------------------------------------------------------------------------- */
/*  Teams                                                                      */
/* -------------------------------------------------------------------------- */

export async function getTeams(): Promise<Team[]> {
  return NFL_TEAMS;
}

export async function getTeam(id: string): Promise<Team | undefined> {
  return NFL_TEAMS.find((t) => t.id === id.toUpperCase());
}

/** Resolve free-text team references from the sheet ("Seahawks", "SEA", "Seattle Seahawks"). */
export function resolveTeam(raw?: string): Team | undefined {
  return resolveTeamName(raw, NFL_TEAMS);
}

export function teamForCoach(user: string): Team | undefined {
  return NFL_TEAMS.find((t) => t.controlledBy?.toUpperCase() === user.toUpperCase());
}

/* -------------------------------------------------------------------------- */
/*  Year context (derived from every dated tab)                                */
/* -------------------------------------------------------------------------- */

async function getYearSpan(): Promise<{ firstYear: number; year: number }> {
  const [champions, awards, careers, records, events] = await Promise.all([
    getRows("CHAMPIONS"),
    getRows("AWARDS"),
    getRows("L_CAREERS"),
    getRows("L_RECORDS"),
    getRows("L_EVENTS"),
  ]);

  const years: number[] = [];
  for (const r of [...champions, ...awards, ...records, ...events]) {
    const y = toIntOrUndefined(r["YEAR"]);
    if (y) years.push(y);
  }
  for (const r of careers) {
    const y = toIntOrUndefined(r["YEAR"]);
    if (y) years.push(y);
  }

  if (years.length === 0) {
    return { firstYear: FALLBACK_YEAR, year: FALLBACK_YEAR };
  }
  return { firstYear: Math.min(...years), year: Math.max(...years) };
}

/* -------------------------------------------------------------------------- */
/*  League status (tab: LEAGUE_STATUS)                                         */
/* -------------------------------------------------------------------------- */

function parsePhase(raw: string): { phase: LeaguePhase; week?: number } {
  const s = raw.toUpperCase();
  const weekMatch = s.match(/WEEK\s+(\d+)/);
  const week = weekMatch ? parseInt(weekMatch[1]!, 10) : undefined;

  if (s.includes("PRESEASON")) return { phase: "Preseason", week };
  if (
    s.includes("PLAYOFF") ||
    s.includes("WILD CARD") ||
    s.includes("DIVISIONAL") ||
    s.includes("CONFERENCE CHAMP") ||
    s.includes("SUPER BOWL")
  )
    return { phase: "Playoffs", week };
  if (
    s.includes("OFFSEASON") ||
    s.includes("DRAFT") ||
    s.includes("FREE AGENCY") ||
    s.includes("COMBINE")
  )
    return { phase: "Offseason", week };
  if (s.includes("WEEK")) return { phase: "Regular Season", week };
  return { phase: "Unknown", week };
}

export async function getLeagueStatus(): Promise<LeagueStatus> {
  const [rows, span] = await Promise.all([
    getRows("LEAGUE_STATUS"),
    getYearSpan(),
  ]);
  const raw = rows[0]?.["STATUS_DATE"]?.trim() || "Preseason";
  const { phase, week } = parsePhase(raw);

  return {
    raw,
    phase,
    week,
    year: span.year,
    firstYear: span.firstYear,
    seasonNumber: span.year - span.firstYear + 1,
  };
}

/* -------------------------------------------------------------------------- */
/*  Coaches / careers (tab: L_CAREERS)                                         */
/* -------------------------------------------------------------------------- */

function mapCareerRow(
  r: Record<string, string>,
  driveMap: Record<string, string>,
): CoachSeasonRow {
  return {
    user: r["USER"]?.trim() ?? "",
    coachName: r["COACH_NAME"]?.trim() || undefined,
    year: toIntOrUndefined(r["YEAR"]) ?? FALLBACK_YEAR,
    record: r["RECORD"]?.trim() || undefined,
    team: r["TEAM"]?.trim() || undefined,
    result: r["RESULT"]?.trim() || undefined,
    imageUrl: photoFor(r["DRIVE_ID"], driveMap),
  };
}

function hydrateSeason(row: CoachSeasonRow): CoachSeason {
  const { wins, losses, ties } = parseRecord(row.record);
  const result = (row.result ?? "").toLowerCase();
  const wonSuperBowl =
    /super bowl/.test(result) && /(won|champ|winner)/.test(result);
  const madePlayoffs =
    result.length > 0 &&
    !/missed|did not|no playoff|out of/.test(result);

  return {
    ...row,
    wins,
    losses,
    ties,
    teamId: resolveTeam(row.team)?.id ?? teamForCoach(row.user)?.id,
    madePlayoffs: madePlayoffs || wonSuperBowl,
    wonSuperBowl,
  };
}

export async function getCoaches(): Promise<Coach[]> {
  const [raw, driveMap] = await Promise.all([
    getRows("L_CAREERS"),
    getDriveMap(),
  ]);
  const rows = raw.map((r) => mapCareerRow(r, driveMap)).filter((r) => r.user);

  const byUser = new Map<string, CoachSeasonRow[]>();
  for (const row of rows) {
    const list = byUser.get(row.user) ?? [];
    list.push(row);
    byUser.set(row.user, list);
  }

  const coaches: Coach[] = [];
  for (const [user, seasonRows] of byUser) {
    const seasons = seasonRows
      .map(hydrateSeason)
      .sort((a, b) => a.year - b.year);

    const team = teamForCoach(user);
    const coachName = seasons.find((s) => s.coachName)?.coachName;

    const careerWins = sum(seasons, (s) => s.wins);
    const careerLosses = sum(seasons, (s) => s.losses);
    const careerTies = sum(seasons, (s) => s.ties);
    const playedSeasons = seasons.filter(
      (s) => s.wins + s.losses + s.ties > 0 || s.result,
    );

    coaches.push({
      user,
      displayName: titleCase(user),
      coachName,
      teamId: team?.id,
      avatarColor: team?.primaryColor ?? colorFromString(user),
      seasons,
      careerWins,
      careerLosses,
      careerTies,
      seasonsPlayed: playedSeasons.length,
      playoffAppearances: seasons.filter((s) => s.madePlayoffs).length,
      championships: seasons.filter((s) => s.wonSuperBowl).length,
      bestFinish: seasons.find((s) => s.wonSuperBowl)?.result,
    });
  }

  // Rank by championships, then career wins.
  return coaches.sort(
    (a, b) =>
      b.championships - a.championships ||
      b.careerWins - a.careerWins ||
      a.displayName.localeCompare(b.displayName),
  );
}

export async function getCoach(user: string): Promise<Coach | undefined> {
  const coaches = await getCoaches();
  return coaches.find((c) => c.user.toLowerCase() === user.toLowerCase());
}

/* -------------------------------------------------------------------------- */
/*  Champions (tab: CHAMPIONS)                                                 */
/* -------------------------------------------------------------------------- */

function mapChampionshipRow(
  r: Record<string, string>,
  driveMap: Record<string, string>,
): ChampionshipResult {
  return {
    year: toIntOrUndefined(r["YEAR"]) ?? FALLBACK_YEAR,
    game: r["GAME"]?.trim() ?? "",
    winner: r["WINNER"]?.trim() || undefined,
    description: r["GAME_DESCRIPTION"]?.trim() || undefined,
    imageUrl: photoFor(r["DRIVE_ID"], driveMap),
  };
}

export async function getSeasonChampions(): Promise<SeasonChampions[]> {
  const [raw, driveMap] = await Promise.all([
    getRows("CHAMPIONS"),
    getDriveMap(),
  ]);
  const rows = raw
    .map((r) => mapChampionshipRow(r, driveMap))
    .filter((r) => r.game);

  const byYear = new Map<number, SeasonChampions>();
  for (const row of rows) {
    const entry = byYear.get(row.year) ?? { year: row.year, decided: false };
    const g = row.game.toLowerCase();
    if (g.includes("afc")) entry.afc = row;
    else if (g.includes("nfc")) entry.nfc = row;
    else if (g.includes("super bowl")) entry.superBowl = row;
    entry.decided = Boolean(entry.superBowl?.winner);
    entry.imageUrl =
      entry.superBowl?.imageUrl ?? entry.nfc?.imageUrl ?? entry.afc?.imageUrl;
    byYear.set(row.year, entry);
  }

  return [...byYear.values()].sort((a, b) => b.year - a.year);
}

/* -------------------------------------------------------------------------- */
/*  Awards (tab: AWARDS)                                                       */
/* -------------------------------------------------------------------------- */

export async function getAwardsBySeason(): Promise<SeasonAwards[]> {
  const [raw, driveMap] = await Promise.all([getRows("AWARDS"), getDriveMap()]);
  const rows = raw.map((r) => ({
    year: toIntOrUndefined(r["YEAR"]) ?? FALLBACK_YEAR,
    award: r["AWARD"]?.trim() ?? "",
    winner: r["WINNER"]?.trim() || undefined,
    imageUrl: photoFor(r["DRIVE_ID"], driveMap),
  })) as Award[];

  const byYear = new Map<number, Award[]>();
  for (const row of rows.filter((r) => r.award)) {
    const list = byYear.get(row.year) ?? [];
    list.push(row);
    byYear.set(row.year, list);
  }

  return [...byYear.entries()]
    .map(([year, awards]) => ({
      year,
      awards,
      decided: awards.some((a) => a.winner),
      imageUrl: awards.find((a) => a.imageUrl)?.imageUrl,
    }))
    .sort((a, b) => b.year - a.year);
}

/* -------------------------------------------------------------------------- */
/*  Hall of Fame (tab: HALL_OF_FAME)                                           */
/* -------------------------------------------------------------------------- */

export async function getHallOfFame(): Promise<HallOfFamer[]> {
  const [raw, driveMap] = await Promise.all([
    getRows("HALL_OF_FAME"),
    getDriveMap(),
  ]);
  return raw
    .map((r) => ({
      name: r["NAME"]?.trim() ?? "",
      inductionYear: toIntOrUndefined(r["INDUCTION_YEAR"]) ?? 0,
      imageUrl: photoFor(r["DRIVE_ID"], driveMap),
    }))
    .filter((h) => h.name)
    .sort((a, b) => b.inductionYear - a.inductionYear);
}

/* -------------------------------------------------------------------------- */
/*  Record book (tab: L_RECORDS)                                               */
/* -------------------------------------------------------------------------- */

export async function getRecords(): Promise<LeagueRecord[]> {
  const [raw, driveMap] = await Promise.all([
    getRows("L_RECORDS"),
    getDriveMap(),
  ]);
  return raw
    .map((r, i) => ({
      id: `rec-${i}`,
      year: toIntOrUndefined(r["YEAR"]),
      record: r["RECORD"]?.trim() ?? "",
      player: r["PLAYER"]?.trim() || undefined,
      amount: r["AMOUNT"]?.trim() || undefined,
      imageUrl: photoFor(r["DRIVE_ID"], driveMap),
    }))
    .filter((r) => r.record);
}

/* -------------------------------------------------------------------------- */
/*  League lore (tab: L_EVENTS)                                                */
/* -------------------------------------------------------------------------- */

function loreScope(type: string): LeagueEvent["scope"] {
  const t = type.toUpperCase();
  if (t.includes("OUTER")) return "outer";
  if (t.includes("INTRA")) return "intra";
  return "other";
}

export async function getLore(): Promise<LeagueEvent[]> {
  const [raw, driveMap] = await Promise.all([
    getRows("L_EVENTS"),
    getDriveMap(),
  ]);
  return raw
    .map((r, i) => {
      const name = r["EVENT_NAME"]?.trim() ?? "";
      const type = r["EVENT_TYPE"]?.trim() ?? "";
      return {
        id: `lore-${i}`,
        slug: name ? slugify(name) : `lore-${i}`,
        year: toIntOrUndefined(r["YEAR"]),
        name,
        type,
        scope: loreScope(type),
        description: r["EVENT_DESCRIPTION"]?.trim() || undefined,
        imageUrl: photoFor(r["DRIVE_ID"], driveMap),
      };
    })
    .filter((e) => e.name)
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
}

export async function getLoreEvent(
  slug: string,
): Promise<LeagueEvent | undefined> {
  return (await getLore()).find((e) => e.slug === slug);
}

export async function getAllLoreSlugs(): Promise<string[]> {
  return (await getLore()).map((e) => e.slug);
}

/* -------------------------------------------------------------------------- */
/*  Media personalities (tab: X_PERSONALITIES)                                 */
/* -------------------------------------------------------------------------- */

function handleFromName(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z0-9]/g, ""))
    .filter(Boolean)
    .map((w) => w[0]!.toUpperCase() + w.slice(1).toLowerCase())
    .join("");
}

export async function getPersonalities(): Promise<MediaPersonality[]> {
  const { year } = await getLeagueStatus();

  return (await getRows("X_PERSONALITIES"))
    .map((r, i) => {
      const name = r["PERSONALITY"]?.trim() ?? "";
      const personalityType = r["PERSONALITY_TYPE"]?.trim() || undefined;
      const startYear = toIntOrUndefined(r["START_YEAR"]);
      const endYear = toIntOrUndefined(r["END_YEAR"]);
      return {
        id: `pers-${i}`,
        slug: name ? slugify(name) : `pers-${i}`,
        name: titleCase(name),
        personalityType,
        role: personalityType ? titleCase(personalityType) : "Personality",
        startYear,
        endYear,
        active:
          (startYear === undefined || startYear <= year) &&
          (endYear === undefined || endYear >= year),
        avatarColor: colorFromString(name || `p${i}`),
        username: handleFromName(name || `personality${i}`),
      };
    })
    .filter((p) => p.name);
}

export async function getPersonality(
  slug: string,
): Promise<MediaPersonality | undefined> {
  return (await getPersonalities()).find((p) => p.slug === slug);
}

export async function getAllPersonalitySlugs(): Promise<string[]> {
  return (await getPersonalities()).map((p) => p.slug);
}

/** Grouped by normalized role, for the Social "accounts" view. */
export async function getPersonalitiesByRole(): Promise<
  Array<{ role: string; people: MediaPersonality[] }>
> {
  const all = await getPersonalities();
  const byRole = new Map<string, MediaPersonality[]>();
  for (const p of all) {
    const list = byRole.get(p.role) ?? [];
    list.push(p);
    byRole.set(p.role, list);
  }
  return [...byRole.entries()]
    .map(([role, people]) => ({ role, people }))
    .sort((a, b) => b.people.length - a.people.length);
}

/* -------------------------------------------------------------------------- */
/*  News + Social — AI-generated, read from data/generated/*.json             */
/*                                                                            */
/*  These files are produced by `npm run generate:news` / `generate:social`   */
/*  (see lib/ai/* and scripts/*). The generator reads the same sheet data     */
/*  through the functions above, so News/Social stay in sync with the sheet   */
/*  on each generation run. Empty arrays => the pages show empty states.      */
/* -------------------------------------------------------------------------- */

const NEWS: NewsArticle[] = [
  ...(generatedNews as unknown as NewsArticle[]),
].sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
const SOCIAL: SocialPost[] = [
  ...(generatedSocial as unknown as SocialPost[]),
].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

export async function getNews(): Promise<NewsArticle[]> {
  return NEWS;
}

export async function getNewsCategories(): Promise<Array<"All" | NewsCategory>> {
  const present = new Set(NEWS.map((a) => a.category));
  const ordered: NewsCategory[] = [
    "Game Recaps",
    "Transactions",
    "League News",
    "Rumors",
    "Commissioner",
  ];
  return ["All", ...ordered.filter((c) => present.has(c))];
}

export async function getFeaturedArticle(): Promise<NewsArticle | undefined> {
  return NEWS.find((a) => a.featured) ?? NEWS[0];
}

export async function getArticleBySlug(
  slug: string,
): Promise<NewsArticle | undefined> {
  return NEWS.find((a) => a.slug === slug);
}

export async function getAllArticleSlugs(): Promise<string[]> {
  return NEWS.map((a) => a.slug);
}

export async function getRelatedArticles(
  slug: string,
  count = 3,
): Promise<NewsArticle[]> {
  const current = NEWS.find((a) => a.slug === slug);
  if (!current) return NEWS.slice(0, count);
  const sameTeam = (a: NewsArticle) =>
    (a.teamIds ?? []).some((id) => (current.teamIds ?? []).includes(id));
  return [...NEWS]
    .filter((a) => a.slug !== slug)
    .map((a) => ({
      a,
      score: (a.category === current.category ? 2 : 0) + (sameTeam(a) ? 1 : 0),
    }))
    .sort(
      (x, y) =>
        y.score - x.score ||
        +new Date(y.a.publishedAt) - +new Date(x.a.publishedAt),
    )
    .slice(0, count)
    .map((s) => s.a);
}

export async function getSocialFeed(limit?: number): Promise<SocialPost[]> {
  return typeof limit === "number" ? SOCIAL.slice(0, limit) : SOCIAL;
}

/** The "no photo assigned" fallback image (Drive file named `Generic`). */
export { getGenericPhoto };

/* -------------------------------------------------------------------------- */
/*  Home page bundle                                                           */
/* -------------------------------------------------------------------------- */

export async function getHomeData() {
  const [status, coaches, champions, lore, personalities, genericPhoto] =
    await Promise.all([
      getLeagueStatus(),
      getCoaches(),
      getSeasonChampions(),
      getLore(),
      getPersonalities(),
      getGenericPhoto(),
    ]);

  // The home feature slot only takes stories that have a real, assigned photo.
  const featuredArticle =
    NEWS.find((a) => a.featured && a.imageUrl) ?? NEWS.find((a) => a.imageUrl);
  const featuredLore = featuredArticle
    ? undefined
    : lore.find((e) => e.imageUrl);

  return {
    status,
    coaches,
    genericPhoto,
    currentChampions: champions.find((c) => c.year === status.year),
    latestLore: lore.slice(0, 3),
    activePersonalities: personalities.filter((p) => p.active),
    featuredArticle,
    featuredLore,
    latestNews: NEWS.filter((a) => a.slug !== featuredArticle?.slug).slice(0, 4),
    latestSocial: SOCIAL.slice(0, 3),
  };
}

/* -------------------------------------------------------------------------- */

function sum<T>(list: T[], pick: (item: T) => number): number {
  return list.reduce((acc, item) => acc + pick(item), 0);
}
