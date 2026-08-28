import Link from "next/link";
import type { NewsArticle, Team } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { CoverImage } from "@/components/cover-image";
import { TeamLogo } from "@/components/team-logo";
import { formatDate, timeAgo } from "@/lib/utils";

/**
 * News article card. `variant`:
 *  - "default"  full card with image (news feed, around-the-league)
 *  - "compact"  small row with thumbnail (related stories)
 */
export function NewsCard({
  article,
  now,
  teams = [],
  variant = "default",
}: {
  article: NewsArticle;
  now: string;
  teams?: Team[];
  variant?: "default" | "compact";
}) {
  const associated = (article.teamIds ?? [])
    .map((id) => teams.find((t) => t.id === id))
    .filter((t): t is Team => Boolean(t));

  if (variant === "compact") {
    return (
      <Link
        href={`/news/${article.slug}`}
        className="group flex gap-3 rounded-lg border border-white/10 bg-navy-800 p-2.5 transition-colors hover:border-white/20"
      >
        <CoverImage
          src={article.imageUrl}
          alt={article.title}
          className="aspect-square h-16 w-16 shrink-0 rounded-md"
          sizes="64px"
        />
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-400">
            {article.category}
          </p>
          <p className="line-clamp-2 text-sm font-semibold leading-snug text-slate-100">
            {article.title}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {timeAgo(article.publishedAt, now)}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/news/${article.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-navy-800 shadow-card transition-transform duration-200 hover:-translate-y-0.5"
    >
      <CoverImage
        src={article.imageUrl}
        alt={article.title}
        className="aspect-[16/9] w-full"
        sizes="(max-width: 768px) 100vw, 400px"
      />
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center gap-2">
          <Badge variant="outline">{article.category}</Badge>
          {associated.length > 0 && (
            <span className="flex items-center gap-1">
              {associated.slice(0, 3).map((t) => (
                <TeamLogo key={t.id} team={t} size={18} />
              ))}
            </span>
          )}
        </div>
        <h3 className="font-display text-lg font-bold leading-snug tracking-tight text-slate-50">
          {article.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-400">
          {article.summary}
        </p>
        <div className="mt-3 flex items-center gap-2 pt-1 text-xs text-slate-500">
          <span className="font-semibold text-slate-400">{article.author}</span>
          <span>•</span>
          <span>{formatDate(article.publishedAt)}</span>
          <span className="ml-auto">{timeAgo(article.publishedAt, now)}</span>
        </div>
      </div>
    </Link>
  );
}
