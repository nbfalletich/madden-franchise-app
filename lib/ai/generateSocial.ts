import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { createHash } from "node:crypto";
import type { SocialPost } from "@/lib/types";
import type { StoryCandidate } from "./storyCandidates";

const MODEL = process.env.SOCIAL_MODEL?.trim() || "claude-opus-5";
const EFFORT = (process.env.SOCIAL_EFFORT?.trim() || "low") as
  | "low"
  | "medium"
  | "high"
  | "xhigh"
  | "max";

const client = new Anthropic();

/** An account allowed to post about a candidate. */
export interface SocialAuthorSpec {
  name: string;
  handle: string;
  kind: SocialPost["authorKind"];
  /** raw PERSONALITY_TYPE, or "coach" */
  voiceType?: string;
  /** PERSONALITY_TYPE === "PUBLIC FIGURE" — posts off-topic, in real-world voice */
  isPublicFigure?: boolean;
  teamId?: string;
  avatarColor: string;
  verified?: boolean;
}

const ThreadSchema = z.object({
  posts: z
    .array(
      z.object({
        authorHandle: z.string().describe("Exact handle from the roster."),
        content: z.string().describe("1-3 sentences in that account's voice."),
        replyToIndex: z
          .number()
          .describe("0-based index of an earlier post this replies to, or -1."),
      }),
    )
    .describe(
      "Exactly one post per handle in the roster, in roster order. A few may be short replies (replyToIndex) but every handle still appears once.",
    ),
});

export async function generateThread(
  candidate: StoryCandidate,
  authors: SocialAuthorSpec[],
  systemBible: string,
): Promise<SocialPost[]> {
  const roster = authors.map((a) => ({
    handle: a.handle,
    name: a.name,
    type: a.voiceType ?? a.kind,
    mode: a.isPublicFigure ? "offtopic" : "react",
  }));

  const userContent = [
    "Everyone on this roster posts once. See THE FEED rules in the system prompt.",
    "",
    "THE MOMENT (facts for 'react' posts only):",
    JSON.stringify(candidate.facts, null, 2),
    "",
    "ROSTER (one post per handle, keep this order):",
    JSON.stringify(roster, null, 2),
  ].join("\n");

  const res = await client.messages.parse({
    model: MODEL,
    max_tokens: 8000,
    thinking: { type: "adaptive" },
    output_config: { effort: EFFORT, format: zodOutputFormat(ThreadSchema) },
    system: [
      { type: "text", text: systemBible, cache_control: { type: "ephemeral" } },
    ],
    messages: [{ role: "user", content: userContent }],
  });

  const parsed = res.parsed_output;
  if (!parsed) throw new Error(`No social output for ${candidate.sourceKey}`);

  const byHandle = new Map(authors.map((a) => [a.handle.toLowerCase(), a]));
  const base = Date.now();
  const posts = parsed.posts;
  const out: SocialPost[] = [];
  const seen = new Set<string>();

  posts.forEach((p, i) => {
    const key = p.authorHandle.trim().toLowerCase();
    const author = byHandle.get(key);
    const content = p.content.trim();
    if (!author || !content || seen.has(key)) return;
    seen.add(key);

    const replyAuthor =
      p.replyToIndex >= 0 && posts[p.replyToIndex]
        ? byHandle.get(posts[p.replyToIndex]!.authorHandle.trim().toLowerCase())
        : undefined;

    const idSeed = `${candidate.slug}#${author.handle}#${content}`;
    out.push({
      id: `s-${createHash("sha1").update(idSeed).digest("hex").slice(0, 12)}`,
      authorName: author.name,
      authorHandle: author.handle,
      authorKind: author.kind,
      avatarColor: author.avatarColor,
      verified: author.verified,
      teamId: author.teamId,
      createdAt: new Date(base - (posts.length - i) * 5 * 60_000).toISOString(),
      content,
      replyTo: replyAuthor && replyAuthor.handle !== author.handle ? replyAuthor.handle : undefined,
      likes: seededCount(idSeed, 3, 90),
      comments: seededCount(idSeed + "c", 0, 20),
      reposts: seededCount(idSeed + "r", 0, 14),
      threadSlug: candidate.slug,
      sourceKey: candidate.sourceKey,
    });
  });

  return out;
}

function seededCount(seed: string, min: number, max: number): number {
  const n = parseInt(createHash("sha1").update(seed).digest("hex").slice(0, 8), 16);
  return min + (n % (max - min + 1));
}
