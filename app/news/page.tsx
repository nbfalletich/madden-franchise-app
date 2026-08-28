import type { Metadata } from "next";
import { Newspaper, Sparkles } from "lucide-react";
import { getLeagueStatus } from "@/lib/data/leagueData";
import { EmptyState } from "@/components/empty-state";

export const metadata: Metadata = {
  title: "News",
  description: "Everything happening around the league.",
};

export const revalidate = 300;

const PLANNED_CATEGORIES = [
  "Game Recaps",
  "Transactions",
  "League News",
  "Rumors",
  "Commissioner",
];

export default async function NewsPage() {
  const status = await getLeagueStatus();

  return (
    <div className="animate-fade-in">
      <header className="mb-6">
        <h1 className="font-display text-4xl font-extrabold uppercase tracking-tight text-slate-50">
          News
        </h1>
        <p className="mt-1 text-slate-400">
          Everything happening around the league.
        </p>
      </header>

      <div className="mb-5 flex flex-wrap gap-2 opacity-50">
        {PLANNED_CATEGORIES.map((c) => (
          <span
            key={c}
            className="rounded-full border border-white/15 px-3.5 py-1.5 text-sm font-semibold text-slate-400"
          >
            {c}
          </span>
        ))}
      </div>

      <EmptyState
        icon={Newspaper}
        title="The newsroom opens with Week 1"
        description={`It's ${status.raw.toLowerCase()}. Once games are played, this feed will fill with recaps, transactions, and headlines.`}
        className="py-14"
      />

      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
        <Sparkles className="h-3.5 w-3.5" />
        Planned: AI-generated stories from league results and personalities.
      </div>
    </div>
  );
}
