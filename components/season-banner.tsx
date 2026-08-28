import type { LeagueStatus } from "@/lib/types";

const PHASE_TONE: Record<string, string> = {
  Preseason: "text-sky-300",
  "Regular Season": "text-emerald-300",
  Playoffs: "text-amber-300",
  Offseason: "text-slate-300",
  Unknown: "text-slate-300",
};

/**
 * Compact league identity strip for the top of the home page.
 *
 *   MADDEN 27 FRANCHISE
 *   2027 Season
 *   Preseason Week 1
 */
export function SeasonBanner({ status }: { status: LeagueStatus }) {
  return (
    <section className="overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-navy-700 via-navy-800 to-navy-950">
      <div className="relative px-5 py-6 sm:px-7 sm:py-8">
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-1/2 opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(120deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 26px)",
          }}
        />
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-400">
          Madden 27 Franchise
        </p>
        <h1 className="mt-1 font-display text-3xl font-extrabold leading-none tracking-tight text-slate-50 sm:text-4xl">
          {status.year} Season
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-300">
          <span
            className={`font-semibold ${PHASE_TONE[status.phase] ?? "text-slate-100"}`}
          >
            {status.raw}
          </span>
          <span className="text-slate-600">•</span>
          <span>Season {status.seasonNumber}</span>
          <span className="text-slate-600">•</span>
          <span>Est. {status.firstYear}</span>
        </div>
      </div>
    </section>
  );
}
