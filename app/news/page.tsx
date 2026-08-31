import type { Metadata } from "next";
import { Newspaper, Sparkles } from "lucide-react";
import {
  getGenericPhoto,
  getLeagueStatus,
  getNews,
  getNewsCategories,
  getTeams,
} from "@/lib/data/leagueData";
import { NewsFeed } from "@/components/news-feed";
import { EmptyState } from "@/components/empty-state";

export const metadata: Metadata = {
  title: "News",
  description: "Everything happening around the league.",
};

export const revalidate = 300;

export default async function NewsPage() {
  const [articles, categories, teams, status, genericPhoto] = await Promise.all([
    getNews(),
    getNewsCategories(),
    getTeams(),
    getLeagueStatus(),
    getGenericPhoto(),
  ]);

  const now = new Date().toISOString();

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

      {articles.length > 0 ? (
        <NewsFeed
          articles={articles}
          categories={categories}
          teams={teams}
          now={now}
          genericImageUrl={genericPhoto}
        />
      ) : (
        <>
          <EmptyState
            icon={Newspaper}
            title="The newsroom opens with Week 1"
            description={`It's ${status.raw.toLowerCase()}. Stories are generated from league results and lore — once there's something to write about, it lands here.`}
            className="py-14"
          />
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
            <Sparkles className="h-3.5 w-3.5" />
            Run <code className="rounded bg-white/5 px-1">npm run generate:news</code>{" "}
            to populate this feed.
          </div>
        </>
      )}
    </div>
  );
}
