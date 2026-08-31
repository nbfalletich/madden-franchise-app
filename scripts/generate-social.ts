/**
 * Generate AI social threads from the league data -> data/generated/social.json.
 *
 * APPEND-ONLY ARCHIVE: existing posts are never removed. Deleting or editing a
 * source row does not touch threads already written. New source rows produce
 * new threads. Git history keeps every version.
 *
 *   npm run generate:social                    # new threads only
 *   npm run generate:social -- --only <slug>   # rewrite specific thread(s), comma-separated
 *   npm run generate:social -- --force         # rewrite every thread
 *   npm run generate:social -- --limit 3
 *
 * Needs ANTHROPIC_API_KEY. Optional: SOCIAL_MODEL (default claude-opus-5).
 */
import "./_env"; // must stay first — loads .env.local before the data layer evaluates
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type { SocialPost } from "@/lib/types";
import { getCoaches, getPersonalities, getTeams } from "@/lib/data/leagueData";
import { buildLeagueBible } from "@/lib/ai/leagueBible";
import { buildCandidates } from "@/lib/ai/storyCandidates";
import { generateThread, type SocialAuthorSpec } from "@/lib/ai/generateSocial";

const OUT = path.join(process.cwd(), "data", "generated", "social.json");

const args = process.argv.slice(2);
const force = args.includes("--force");
const numArg = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? Number(args[i + 1]) : undefined;
};
const listArg = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? (args[i + 1] ?? "").split(",").map((s) => s.trim()).filter(Boolean) : [];
};
const limit = numArg("--limit") ?? Infinity;
const only = new Set(listArg("--only"));

async function loadExisting(): Promise<SocialPost[]> {
  try {
    return JSON.parse(await readFile(OUT, "utf8"));
  } catch {
    return [];
  }
}

interface AuthorPool {
  /** every active personality — all of them post on every story */
  personalities: SocialAuthorSpec[];
  /** coaches, keyed by team id, added only when the story involves their team */
  coachByTeam: Map<string, SocialAuthorSpec>;
}

async function buildAuthorPool(): Promise<AuthorPool> {
  const [coaches, personalities, teams] = await Promise.all([
    getCoaches(),
    getPersonalities(),
    getTeams(),
  ]);

  const personalityAuthors: SocialAuthorSpec[] = personalities
    .filter((p) => p.active)
    .map((p) => ({
      name: p.name,
      handle: p.username,
      kind: "personality",
      voiceType: p.personalityType || "personality",
      isPublicFigure: (p.personalityType ?? "").toUpperCase() === "PUBLIC FIGURE",
      avatarColor: p.avatarColor,
      verified: true,
    }));

  const coachByTeam = new Map<string, SocialAuthorSpec>();
  for (const c of coaches) {
    if (!c.teamId) continue;
    const team = teams.find((t) => t.id === c.teamId);
    coachByTeam.set(c.teamId, {
      name: c.displayName,
      handle: team ? `${team.abbreviation}coach` : c.user.toLowerCase(),
      kind: "coach",
      voiceType: "coach",
      teamId: c.teamId,
      avatarColor: c.avatarColor,
    });
  }

  return { personalities: personalityAuthors, coachByTeam };
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not set");

  const [existing, candidates, coaches, teams, pool] = await Promise.all([
    loadExisting(),
    buildCandidates(),
    getCoaches(),
    getTeams(),
    buildAuthorPool(),
  ]);

  const bible = buildLeagueBible(coaches, teams, "social");
  const haveThreads = new Set(existing.map((p) => p.threadSlug));

  const todo = candidates
    .filter((c) => {
      if (only.size) return only.has(c.slug);
      if (force) return true;
      return !haveThreads.has(c.slug);
    })
    .slice(0, Number.isFinite(limit) ? limit : undefined);

  console.log(
    `${candidates.length} candidate(s), ${existing.length} archived post(s), ${todo.length} thread(s) to write`,
  );

  const regenSlugs = new Set(todo.map((c) => c.slug));
  const fresh: SocialPost[] = [];
  for (const c of todo) {
    process.stdout.write(`  • ${c.slug} … `);
    try {
      // every active personality posts; coaches join only for their own stories
      const involvedCoaches = c.teamIds
        .map((id) => pool.coachByTeam.get(id))
        .filter((a): a is SocialAuthorSpec => Boolean(a));
      const authors = [...pool.personalities, ...involvedCoaches];
      const thread = await generateThread(c, authors, bible);
      fresh.push(...thread);
      console.log(`ok (${thread.length})`);
    } catch (err) {
      console.log(`FAILED: ${(err as Error).message}`);
    }
  }

  // --force regenerates every candidate, so `fresh` is the whole archive and
  // replaces the file (old versions stay in git history). Otherwise: append-only
  // — keep every post whose thread is not being (re)generated in this run.
  const merged = (
    force ? fresh : [...existing.filter((p) => !regenSlugs.has(p.threadSlug)), ...fresh]
  ).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(merged, null, 2) + "\n");
  console.log(
    `Archive now holds ${merged.length} post(s) (${path.relative(process.cwd(), OUT)})`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
