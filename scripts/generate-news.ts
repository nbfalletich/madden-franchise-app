/**
 * Generate AI news articles from the league data -> data/generated/news.json.
 *
 * APPEND-ONLY ARCHIVE: once an article exists it is never removed. Deleting or
 * editing the source row in the sheet does NOT change or delete an existing
 * story. New source rows produce new stories. Git history keeps every version.
 *
 *   npm run generate:news                    # write stories for new slugs only
 *   npm run generate:news -- --only <slug>   # rewrite specific slug(s), comma-separated
 *   npm run generate:news -- --force         # rewrite every story (old text stays in git)
 *   npm run generate:news -- --limit 3       # cap this run
 *
 * Needs ANTHROPIC_API_KEY. Optional: NEWS_MODEL (default claude-opus-5).
 */
import "./_env"; // must stay first — loads .env.local before the data layer evaluates
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { getCoaches, getTeams } from "@/lib/data/leagueData";
import { buildLeagueBible } from "@/lib/ai/leagueBible";
import { buildCandidates } from "@/lib/ai/storyCandidates";
import { generateStory, type GeneratedArticle } from "@/lib/ai/generateStory";

const OUT = path.join(process.cwd(), "data", "generated", "news.json");

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

async function loadExisting(): Promise<GeneratedArticle[]> {
  try {
    return JSON.parse(await readFile(OUT, "utf8"));
  } catch {
    return [];
  }
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not set");

  const [existing, candidates, coaches, teams] = await Promise.all([
    loadExisting(),
    buildCandidates(),
    getCoaches(),
    getTeams(),
  ]);

  const bible = buildLeagueBible(coaches, teams, "news");
  const haveSlugs = new Set(existing.map((a) => a.slug));

  const todo = candidates
    .filter((c) => {
      if (only.size) return only.has(c.slug);
      if (force) return true;
      return !haveSlugs.has(c.slug); // append-only: only brand-new slugs
    })
    .slice(0, Number.isFinite(limit) ? limit : undefined);

  console.log(
    `${candidates.length} candidate(s), ${existing.length} archived, ${todo.length} to write` +
      (force ? " (--force)" : only.size ? ` (--only ${[...only].join(",")})` : ""),
  );

  const fresh: GeneratedArticle[] = [];
  for (const c of todo) {
    process.stdout.write(`  • ${c.slug} … `);
    try {
      fresh.push(await generateStory(c, bible));
      console.log("ok");
    } catch (err) {
      console.log(`FAILED: ${(err as Error).message}`);
    }
  }

  // --force regenerates every candidate, so `fresh` is the whole archive.
  // Otherwise append-only: keep every existing article; a freshly generated one
  // replaces the same slug in place. Nothing is ever dropped from the file
  // (and every prior version is in git history regardless).
  const bySlug = new Map((force ? [] : existing).map((a) => [a.slug, a]));
  for (const a of fresh) bySlug.set(a.slug, a);
  const merged = [...bySlug.values()].sort(
    (a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt),
  );

  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(merged, null, 2) + "\n");
  console.log(
    `Archive now holds ${merged.length} article(s) (${path.relative(process.cwd(), OUT)})`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
