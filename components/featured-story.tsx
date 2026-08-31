import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { NewsArticle } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { CoverImage } from "@/components/cover-image";
import { formatDate, timeAgo } from "@/lib/utils";

/**
 * Large hero card for the top news story on the home page.
 */
export function FeaturedStory({
  article,
  now,
  genericImageUrl,
}: {
  article: NewsArticle;
  now: string;
  genericImageUrl?: string;
}) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group block overflow-hidden rounded-xl border border-white/10 bg-navy-800 shadow-card transition-transform duration-200 hover:-translate-y-0.5"
    >
      <div className="relative">
        <CoverImage
          src={article.imageUrl}
          fallbackSrc={genericImageUrl}
          alt={article.title}
          priority
          className="aspect-[16/10] w-full sm:aspect-[21/9]"
          overlay
          gradientFrom="#1e293b"
          gradientTo="#0a0f1e"
        />
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
          <Badge variant="accent" className="mb-2">
            {article.category}
          </Badge>
          <h2 className="font-display text-2xl font-extrabold leading-tight tracking-tight text-white drop-shadow-sm sm:text-3xl">
            {article.title}
          </h2>
        </div>
      </div>
      <div className="p-4 sm:p-6">
        <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
          {article.subheadline ?? article.summary}
        </p>
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-400">{article.author}</span>
          <span>•</span>
          <span>{formatDate(article.publishedAt)}</span>
          <span className="ml-auto inline-flex items-center gap-1 font-semibold text-amber-400">
            Read <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
