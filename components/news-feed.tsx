"use client";

import { useMemo, useState } from "react";
import type { NewsArticle, NewsCategory, Team } from "@/lib/types";
import { NewsCard } from "@/components/news-card";
import { cn } from "@/lib/utils";

type Filter = "All" | NewsCategory;

/**
 * Client-side category filtering for the News page. Receives fully-structured
 * articles + the category list from the server component.
 */
export function NewsFeed({
  articles,
  categories,
  teams,
  now,
  genericImageUrl,
}: {
  articles: NewsArticle[];
  categories: Filter[];
  teams: Team[];
  now: string;
  genericImageUrl?: string;
}) {
  const [active, setActive] = useState<Filter>("All");

  const counts = useMemo(() => {
    const map = new Map<Filter, number>([["All", articles.length]]);
    for (const a of articles) {
      map.set(a.category, (map.get(a.category) ?? 0) + 1);
    }
    return map;
  }, [articles]);

  const filtered = useMemo(
    () =>
      active === "All"
        ? articles
        : articles.filter((a) => a.category === active),
    [active, articles],
  );

  return (
    <div>
      <div className="-mx-4 mb-5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max gap-2">
          {categories.map((cat) => {
            const isActive = cat === active;
            const count = counts.get(cat) ?? 0;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActive(cat)}
                aria-pressed={isActive}
                className={cn(
                  "whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors",
                  isActive
                    ? "border-amber-400 bg-amber-400 text-navy-950"
                    : "border-white/15 text-slate-300 hover:border-white/30 hover:text-slate-100",
                )}
              >
                {cat}
                <span
                  className={cn(
                    "ml-1.5 text-xs",
                    isActive ? "text-navy-950/60" : "text-slate-500",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-navy-800 p-8 text-center text-sm text-slate-400">
          No stories in this category yet.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((article) => (
            <NewsCard
              key={article.slug}
              article={article}
              teams={teams}
              now={now}
              genericImageUrl={genericImageUrl}
            />
          ))}
        </div>
      )}
    </div>
  );
}
