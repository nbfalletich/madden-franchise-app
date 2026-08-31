/**
 * Domain models for the Madden 27 Franchise Hub.
 *
 * These map to the Google Sheets workbook. Tab -> model:
 *
 *   LEAGUE_STATUS    -> LeagueStatus
 *   L_CAREERS        -> CoachSeasonRow (raw) -> Coach (aggregated)
 *   CHAMPIONS        -> ChampionshipResult (raw) -> SeasonChampions (grouped by year)
 *   AWARDS           -> Award
 *   HALL_OF_FAME     -> HallOfFamer
 *   L_RECORDS        -> LeagueRecord
 *   L_EVENTS         -> LeagueEvent   (league "lore")
 *   X_PERSONALITIES  -> MediaPersonality
 *
 *   (no tab)         -> Team  — 32 NFL teams hardcoded in lib/data/nflTeams.ts
 *
 * News and Social have no tab yet — see NewsArticle / SocialPost, kept for the
 * planned AI-generated content.
 */

/* ------------------------------------------------------------------ */
/*  Teams                                                              */
/* ------------------------------------------------------------------ */

export type Conference = "AFC" | "NFC";
export type Division = "North" | "South" | "East" | "West";

export interface Team {
  id: string; // team abbreviation, e.g. "DAL"
  city: string;
  name: string;
  abbreviation: string;
  conference: Conference;
  division: Division;
  primaryColor: string;
  secondaryColor: string;
  /** L_CAREERS `USER` value of the human coach, if any. Undefined => CPU. */
  controlledBy?: string;
}

/* ------------------------------------------------------------------ */
/*  League status  (tab: LEAGUE_STATUS)                                */
/* ------------------------------------------------------------------ */

export type LeaguePhase =
  | "Preseason"
  | "Regular Season"
  | "Playoffs"
  | "Offseason"
  | "Unknown";

export interface LeagueStatus {
  /** the raw STATUS_DATE cell, e.g. "PRESEASON WEEK 1" */
  raw: string;
  phase: LeaguePhase;
  week?: number;
  /** current league year, derived from the data (max YEAR seen), fallback 2027 */
  year: number;
  /** which season number this is (year - firstYear + 1) */
  seasonNumber: number;
  firstYear: number;
}

/* ------------------------------------------------------------------ */
/*  Coaches / careers  (tab: L_CAREERS)                                */
/* ------------------------------------------------------------------ */

export interface CoachSeasonRow {
  user: string;
  coachName?: string;
  year: number;
  record?: string; // "12-5" or "12-4-1"
  team?: string; // raw team text from the sheet
  result?: string; // e.g. "Lost Divisional Round", "Won Super Bowl"
  imageUrl?: string; // resolved from DRIVE_ID
}

export interface CoachSeason extends CoachSeasonRow {
  wins: number;
  losses: number;
  ties: number;
  teamId?: string; // resolved against NFL_TEAMS
  madePlayoffs: boolean;
  wonSuperBowl: boolean;
}

export interface Coach {
  user: string; // "NATHAN"
  displayName: string; // title-cased user, e.g. "Nathan"
  coachName?: string; // in-game coach name once set
  teamId?: string; // current team (from NFL_TEAMS.controlledBy)
  avatarColor: string;
  seasons: CoachSeason[];
  // career aggregates
  careerWins: number;
  careerLosses: number;
  careerTies: number;
  seasonsPlayed: number;
  playoffAppearances: number;
  championships: number;
  bestFinish?: string;
}

/* ------------------------------------------------------------------ */
/*  Champions  (tab: CHAMPIONS)                                        */
/* ------------------------------------------------------------------ */

export interface ChampionshipResult {
  year: number;
  game: string; // "AFC Championship" | "NFC Championship" | "Super Bowl"
  winner?: string;
  description?: string;
  /** resolved from this row's DRIVE_ID column */
  imageUrl?: string;
}

export interface SeasonChampions {
  year: number;
  afc?: ChampionshipResult;
  nfc?: ChampionshipResult;
  superBowl?: ChampionshipResult;
  decided: boolean; // Super Bowl has a winner
  /** best available photo for the season (Super Bowl row first) */
  imageUrl?: string;
}

/* ------------------------------------------------------------------ */
/*  Awards  (tab: AWARDS)                                              */
/* ------------------------------------------------------------------ */

export interface Award {
  year: number;
  award: string; // "MVP", "COACH OF THE YEAR", "DPOY", "SB MVP", ...
  winner?: string;
  imageUrl?: string;
}

export interface SeasonAwards {
  year: number;
  awards: Award[];
  decided: boolean; // at least one winner filled in
  imageUrl?: string;
}

/* ------------------------------------------------------------------ */
/*  Hall of Fame  (tab: HALL_OF_FAME)                                  */
/* ------------------------------------------------------------------ */

export interface HallOfFamer {
  name: string;
  inductionYear: number;
  imageUrl?: string;
}

/* ------------------------------------------------------------------ */
/*  Record book  (tab: L_RECORDS)                                      */
/* ------------------------------------------------------------------ */

export interface LeagueRecord {
  id: string;
  year?: number;
  record: string; // the record name
  player?: string;
  amount?: string;
  imageUrl?: string;
}

/* ------------------------------------------------------------------ */
/*  League lore  (tab: L_EVENTS)                                       */
/* ------------------------------------------------------------------ */

export type LoreScope = "outer" | "intra" | "other";

export interface LeagueEvent {
  id: string;
  slug: string;
  year?: number;
  name: string;
  /** raw EVENT_TYPE, e.g. "OUTER-LEAGUE LORE" */
  type: string;
  scope: LoreScope;
  description?: string;
  /** resolved from the DRIVE_ID column */
  imageUrl?: string;
}

/* ------------------------------------------------------------------ */
/*  Media personalities  (tab: X_PERSONALITIES)                        */
/* ------------------------------------------------------------------ */

export interface MediaPersonality {
  id: string;
  slug: string;
  name: string;
  /** raw PERSONALITY_TYPE; may be blank in the sheet */
  personalityType?: string;
  role: string; // normalized label, "Personality" when blank
  startYear?: number;
  endYear?: number; // undefined => open-ended
  active: boolean; // current league year within [startYear, endYear]
  avatarColor: string;
  username: string; // synthesized handle
}

/* ------------------------------------------------------------------ */
/*  News + Social — AI-generated from the sheet data                   */
/*  (see lib/ai/*, scripts/generate-*.ts, data/generated/*.json)       */
/* ------------------------------------------------------------------ */

export type NewsCategory =
  | "Game Recaps"
  | "Transactions"
  | "League News"
  | "Rumors"
  | "Commissioner";

export interface PersonalityQuote {
  personality: string;
  quote: string;
}

export interface NewsArticle {
  slug: string;
  title: string;
  subheadline?: string;
  summary: string;
  content: string[];
  category: NewsCategory;
  author: string;
  publishedAt: string; // ISO — set when generated
  imageUrl?: string;
  featured?: boolean;
  teamIds?: string[];
  tags?: string[];
  pullQuote?: string;
  personalityQuotes?: PersonalityQuote[];
  /** dedupe key: `${kind}:${slug}:${hash(source fields)}` — set by the generator */
  sourceKey?: string;
}

export interface SocialPost {
  id: string;
  authorName: string;
  authorHandle: string;
  authorKind: "coach" | "personality" | "team" | "league";
  avatarColor: string;
  verified?: boolean;
  teamId?: string;
  createdAt: string; // ISO
  content: string;
  /** handle this post is replying to, if any */
  replyTo?: string;
  likes: number;
  comments: number;
  reposts: number;
  /** stable id of the candidate/thread this post belongs to (candidate slug) */
  threadSlug: string;
  /** content-hash marker of the source row at generation time */
  sourceKey?: string;
}
