import type { Team } from "@/lib/types";
import { cn, readableTextColor } from "@/lib/utils";

/**
 * Placeholder "crest": a rounded tile with the team abbreviation in team colors.
 * Swap for real logo assets later without touching callers.
 */
export function TeamLogo({
  team,
  size = 40,
  className,
}: {
  team: Pick<Team, "abbreviation" | "primaryColor" | "secondaryColor" | "name">;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center rounded-lg font-display font-extrabold tracking-tight",
        className,
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: team.primaryColor,
        color: readableTextColor(team.primaryColor),
        boxShadow: `inset 0 0 0 2px ${team.secondaryColor}`,
        fontSize: size * 0.34,
      }}
      title={team.name}
      aria-label={team.name}
    >
      {team.abbreviation}
    </div>
  );
}
