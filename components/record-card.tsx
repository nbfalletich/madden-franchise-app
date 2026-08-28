import type { LeagueRecord } from "@/lib/types";

/**
 * Single league record: name, big value, holder, season.
 */
export function RecordCard({ record }: { record: LeagueRecord }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-navy-800 p-4 shadow-card">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-200">{record.record}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
          {record.player && (
            <span className="font-semibold text-slate-400">{record.player}</span>
          )}
          {record.year && (
            <>
              {record.player && <span>•</span>}
              <span>{record.year}</span>
            </>
          )}
          {!record.player && !record.year && <span>Unclaimed</span>}
        </div>
      </div>
      {record.amount && (
        <span className="shrink-0 font-display text-2xl font-extrabold tabular-nums tracking-tight text-amber-400">
          {record.amount}
        </span>
      )}
    </div>
  );
}
