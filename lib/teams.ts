import type { Team } from "./types";

/**
 * Pure team-name resolver, safe to import from client or server components.
 * Matches free-text sheet values like "Seahawks", "SEA", "Seattle Seahawks".
 */
export function resolveTeamName(
  raw: string | undefined,
  teams: Team[],
): Team | undefined {
  if (!raw) return undefined;
  const q = raw.trim().toLowerCase();
  if (!q) return undefined;
  return teams.find(
    (t) =>
      t.id.toLowerCase() === q ||
      t.name.toLowerCase() === q ||
      `${t.city} ${t.name}`.toLowerCase() === q ||
      t.city.toLowerCase() === q ||
      q.includes(t.name.toLowerCase()),
  );
}
