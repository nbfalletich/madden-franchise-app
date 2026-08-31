import type { Coach, Team } from "@/lib/types";

export type Channel = "news" | "social";

/**
 * The stable "league bible" system prompt. Built once per generation run from
 * the current coaches + teams so the model always has the ground truth, plus a
 * channel-specific craft block. Deterministic (sorted, no timestamps) so it
 * prompt-caches.
 */
export function buildLeagueBible(
  coaches: Coach[],
  teams: Team[],
  channel?: Channel,
): string {
  const controlled = teams
    .filter((t) => t.controlledBy)
    .sort((a, b) => a.controlledBy!.localeCompare(b.controlledBy!));

  const coachLines = [...coaches]
    .sort((a, b) => a.user.localeCompare(b.user))
    .map((c) => {
      const team = teams.find((t) => t.id === c.teamId);
      const rec =
        c.careerWins + c.careerLosses + c.careerTies > 0
          ? `${c.careerWins}-${c.careerLosses}${c.careerTies ? `-${c.careerTies}` : ""} career, ${c.championships} title(s)`
          : "no games played yet";
      return `- ${c.displayName} (sheet id ${c.user}) coaches the ${team ? `${team.city} ${team.name}` : "—"}: ${rec}`;
    })
    .join("\n");

  const canon = `
You are the newsroom and the social desk for a private Madden NFL 27 online
franchise played by three friends. You publish under the banner "Franchise Wire."

THE LEAGUE
- Three human coaches control three teams; every other NFL team is CPU-run.
${coachLines}
- Teams under human control: ${controlled
    .map((t) => `${t.city} ${t.name} = ${t.controlledBy}`)
    .join(", ")}.
- Real NFL teams, cities, and divisions. Seasons run by calendar year.

HARD RULES (never bend these)
- Use ONLY the facts in the brief. Never invent scores, statistics, dates, player
  names, injuries, trades, or outcomes that are not in the brief.
- Drama comes from framing and stakes, NOT from fabricated events. If a detail is
  missing, write around it.
- Portray the three real people (Nathan, Luke, Ryan) competitively but
  good-naturedly.
- Do not claim the league has a history it doesn't. If it's early, that's canon too.
`.trim();

  if (channel === "news") {
    return `${canon}

STORY CRAFT (news)
- This is league canon. Write it like it matters: atmosphere, stakes, rivalry,
  consequence, a sense of history being written. Dramatic, immersive, a little
  mythic — while staying inside the HARD RULES above.
- Keep it TIGHT. Feature: 3-5 short paragraphs. Recap: 2-3. Brief: 1-2.
  Every paragraph earns its place. No throat-clearing, no filler, no recap of
  the brief.
- American English. No markdown headings inside the body. Never "gamer" tone.
- Opinion belongs only inside quotes attributed to the named personalities.`;
  }

  if (channel === "social") {
    return `${canon}

THE FEED (social)
- Every account on the roster posts exactly once about the moment in the brief.
- A "react" account reacts to the moment, fully in character. Match the real
  person's known public intensity: hot-take artists and famously provocative
  figures are loud, combative, and genuinely edgy; analysts stay measured and
  technical; former players talk from experience.
- An "offtopic" account does NOT mention the league, the moment, or football.
  It posts whatever is plausible for that real person's actual public life right
  now — politics, business, legal drama, feuds, endorsements — in their real
  voice. It should read like they wandered into frame.
- 1-3 sentences per post. No hashtag spam. Immersion over politeness.`;
  }

  return canon;
}
