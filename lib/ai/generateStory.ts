import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { NewsArticle } from "@/lib/types";
import type { StoryCandidate } from "./storyCandidates";

const MODEL = process.env.NEWS_MODEL?.trim() || "claude-opus-5";
const EFFORT = (process.env.NEWS_EFFORT?.trim() || "medium") as
  | "low"
  | "medium"
  | "high"
  | "xhigh"
  | "max";

/** One shared client per process. Reads ANTHROPIC_API_KEY from the environment. */
const client = new Anthropic();

const ArticleSchema = z.object({
  headline: z.string().describe("Punchy, specific, a little dramatic. Max ~12 words."),
  subheadline: z.string().describe("One sentence that adds information and stakes."),
  body: z
    .array(z.string())
    .describe("Ordered paragraphs, tight prose, no markdown, no headings."),
  pullQuote: z
    .string()
    .describe("One strong line worth pulling out, or empty string if none."),
  personalityQuotes: z
    .array(
      z.object({
        personality: z.string().describe("Exact name from the provided list."),
        quote: z.string().describe("In that personality's voice/type."),
      }),
    )
    .describe("1-2 quotes from the provided personalities, or [] if none fit."),
  tags: z.array(z.string()).describe("2-5 short lowercase tags."),
});

const LENGTH_GUIDANCE: Record<StoryCandidate["length"], string> = {
  feature:
    "A league-canon FEATURE. 3 to 5 SHORT paragraphs. Build atmosphere and stakes fast, then land it. Every line earns its place.",
  recap: "A RECAP. 2 to 3 short paragraphs. Lead with the result, then the meaning of it.",
  brief: "A BRIEF. 1 to 2 short paragraphs. Tight and factual, with a little edge.",
};

export interface GeneratedArticle extends NewsArticle {
  sourceKey: string;
}

export async function generateStory(
  candidate: StoryCandidate,
  systemBible: string,
): Promise<GeneratedArticle> {
  const userContent = [
    LENGTH_GUIDANCE[candidate.length],
    "",
    "STORY BRIEF (the only facts you may use):",
    JSON.stringify(candidate.facts, null, 2),
    "",
    "PERSONALITIES available to quote (attribute by exact name, match their voice):",
    candidate.suggestedVoices.length
      ? JSON.stringify(candidate.suggestedVoices, null, 2)
      : "(none — omit personality quotes)",
    "",
    "Write it now as the Franchise Wire. Dramatic, immersive, tight.",
  ].join("\n");

  const res = await client.messages.parse({
    model: MODEL,
    max_tokens: 8000,
    thinking: { type: "adaptive" },
    output_config: {
      effort: EFFORT,
      format: zodOutputFormat(ArticleSchema),
    },
    system: [
      { type: "text", text: systemBible, cache_control: { type: "ephemeral" } },
    ],
    messages: [{ role: "user", content: userContent }],
  });

  const parsed = res.parsed_output;
  if (!parsed) {
    throw new Error(`Model returned no parseable output for ${candidate.sourceKey}`);
  }

  const body = parsed.body.map((p) => p.trim()).filter(Boolean);
  if (body.length < 1) {
    throw new Error(`Empty body for ${candidate.sourceKey}`);
  }

  return {
    slug: candidate.slug,
    title: parsed.headline.trim(),
    subheadline: parsed.subheadline.trim() || undefined,
    summary: body[0].slice(0, 220),
    content: body,
    category: candidate.category,
    author: "Franchise Wire",
    publishedAt: new Date().toISOString(),
    imageUrl: candidate.imageUrl,
    teamIds: candidate.teamIds.length ? candidate.teamIds : undefined,
    tags: parsed.tags.map((t) => t.trim().toLowerCase()).filter(Boolean),
    pullQuote: parsed.pullQuote.trim() || undefined,
    personalityQuotes: parsed.personalityQuotes
      .filter((q) => q.personality.trim() && q.quote.trim())
      .map((q) => ({ personality: q.personality.trim(), quote: q.quote.trim() })),
    sourceKey: candidate.sourceKey,
  };
}
