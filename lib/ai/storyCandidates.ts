import { createHash } from "node:crypto";
import type { MediaPersonality, NewsCategory } from "@/lib/types";
import {
  getAwardsBySeason,
  getCoaches,
  getLeagueStatus,
  getLore,
  getPersonalities,
  getRecords,
  getSeasonChampions,
  getTeams,
} from "@/lib/data/leagueData";
import { resolveTeamName } from "@/lib/teams";
import { slugify } from "@/lib/utils";

/**
 * A story candidate = one thing worth writing about, with every fact the model
 * needs already resolved (no raw sheet strings). `sourceKey` makes generation
 * idempotent: same key -> already written, skip; changed facts -> new key ->
 * regenerate.
 */
export interface StoryCandidate {
  sourceKey: string;
  kind: "event" | "champion" | "award" | "record" | "career";
  slug: string;
  category: NewsCategory;
  briefTitle: string;
  facts: Record<string, unknown>;
  teamIds: string[];
  suggestedVoices: { name: string; type: string }[];
  /** rough target so the prompt can ask for the right length */
  length: "feature" | "recap" | "brief";
  /** photo for this story, resolved from the source row's DRIVE_ID */
  imageUrl?: string;
}

const hash = (obj: unknown) =>
  createHash("sha1").update(JSON.stringify(obj)).digest("hex").slice(0, 10);

function isPublicFigure(p: MediaPersonality): boolean {
  return (p.personalityType ?? "").toUpperCase() === "PUBLIC FIGURE";
}

/** Personalities to quote inside a news story — never public figures. */
function pickVoices(
  pool: MediaPersonality[],
  preferType: string | null,
  n = 2,
): { name: string; type: string }[] {
  const ranked = pool
    .filter((p) => !isPublicFigure(p))
    .sort(
      (a, b) =>
        (b.personalityType === preferType ? 1 : 0) -
          (a.personalityType === preferType ? 1 : 0) ||
        a.name.localeCompare(b.name),
    );
  return ranked.slice(0, n).map((p) => ({ name: p.name, type: p.role }));
}

export async function buildCandidates(): Promise<StoryCandidate[]> {
  const [lore, champions, awards, records, coaches, status, teams, personalities] =
    await Promise.all([
      getLore(),
      getSeasonChampions(),
      getAwardsBySeason(),
      getRecords(),
      getCoaches(),
      getLeagueStatus(),
      getTeams(),
      getPersonalities(),
    ]);

  const active = personalities.filter((p) => p.active);
  const out: StoryCandidate[] = [];

  // ---- L_EVENTS -> feature stories ----
  for (const e of lore) {
    const facts = {
      title: e.name,
      year: e.year ?? null,
      scope: e.scope, // "outer" | "intra" | "other"
      sheetType: e.type,
      seed: e.description ?? null,
      leaguePhase: status.raw,
    };
    out.push({
      sourceKey: `event:${e.slug}:${hash(facts)}`,
      kind: "event",
      slug: e.slug,
      category: "League News",
      briefTitle: e.name,
      facts,
      teamIds: [],
      suggestedVoices: pickVoices(
        active,
        e.scope === "outer" ? "HOT TAKE ARTIST" : null,
      ),
      length: "feature",
      imageUrl: e.imageUrl,
    });
  }

  // ---- CHAMPIONS -> recap when a Super Bowl has a winner ----
  for (const s of champions) {
    if (!s.superBowl?.winner) continue;
    const champTeam = resolveTeamName(s.superBowl.winner, teams);
    const facts = {
      year: s.year,
      superBowlWinner: s.superBowl.winner,
      superBowlNote: s.superBowl.description ?? null,
      afcChampion: s.afc?.winner ?? null,
      nfcChampion: s.nfc?.winner ?? null,
    };
    out.push({
      sourceKey: `champion:${s.year}:${hash(facts)}`,
      kind: "champion",
      slug: `${s.year}-champions`,
      category: "Game Recaps",
      briefTitle: `${s.year} champions`,
      facts,
      teamIds: [champTeam?.id, resolveTeamName(s.afc?.winner, teams)?.id, resolveTeamName(s.nfc?.winner, teams)?.id].filter(
        (x): x is string => Boolean(x),
      ),
      suggestedVoices: pickVoices(active, "FORMER PLAYER"),
      length: "recap",
      imageUrl: s.imageUrl,
    });
  }

  // ---- AWARDS -> story once at least one winner is filled in ----
  for (const season of awards) {
    if (!season.decided) continue;
    const facts = {
      year: season.year,
      winners: season.awards
        .filter((a) => a.winner)
        .map((a) => ({ award: a.award, winner: a.winner })),
      undecided: season.awards.filter((a) => !a.winner).map((a) => a.award),
    };
    out.push({
      sourceKey: `award:${season.year}:${hash(facts)}`,
      kind: "award",
      slug: `${season.year}-awards`,
      category: "League News",
      briefTitle: `${season.year} awards`,
      facts,
      teamIds: [],
      suggestedVoices: pickVoices(active, "DRAFT ANALYST"),
      length: "recap",
      imageUrl: season.imageUrl,
    });
  }

  // ---- L_RECORDS -> brief ----
  for (const r of records) {
    const facts = {
      record: r.record,
      holder: r.player ?? null,
      amount: r.amount ?? null,
      year: r.year ?? null,
    };
    out.push({
      sourceKey: `record:${slugify(r.record)}:${hash(facts)}`,
      kind: "record",
      slug: `record-${slugify(r.record)}`,
      category: "League News",
      briefTitle: r.record,
      facts,
      teamIds: [],
      suggestedVoices: pickVoices(active, "HOT TAKE ARTIST", 2),
      length: "brief",
      imageUrl: r.imageUrl,
    });
  }

  // ---- L_CAREERS -> season-in-review once a coach's season has a RESULT ----
  for (const coach of coaches) {
    for (const s of coach.seasons) {
      if (!s.result) continue;
      const team = s.teamId ? teams.find((t) => t.id === s.teamId) : undefined;
      const facts = {
        coach: coach.displayName,
        team: team ? `${team.city} ${team.name}` : (s.team ?? null),
        year: s.year,
        record:
          s.wins + s.losses + s.ties > 0
            ? `${s.wins}-${s.losses}${s.ties ? `-${s.ties}` : ""}`
            : null,
        result: s.result,
        careerTitles: coach.championships,
      };
      out.push({
        sourceKey: `career:${coach.user}-${s.year}:${hash(facts)}`,
        kind: "career",
        slug: `${coach.user.toLowerCase()}-${s.year}-review`,
        category: "League News",
        briefTitle: `${coach.displayName}'s ${s.year} season`,
        facts,
        teamIds: team ? [team.id] : [],
        suggestedVoices: pickVoices(active, null),
        length: "recap",
        imageUrl: s.imageUrl,
      });
    }
  }

  return out;
}
