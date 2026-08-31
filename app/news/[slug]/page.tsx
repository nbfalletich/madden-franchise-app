import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Quote } from "lucide-react";
import {
  getAllArticleSlugs,
  getArticleBySlug,
  getGenericPhoto,
  getRelatedArticles,
  getTeams,
} from "@/lib/data/leagueData";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { CoverImage } from "@/components/cover-image";
import { NewsCard } from "@/components/news-card";
import { TeamLogo } from "@/components/team-logo";
import { SectionHeader } from "@/components/section-header";
import { colorFromString, formatDate } from "@/lib/utils";

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getAllArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Story not found" };
  return { title: article.title, description: article.summary };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [article, teams, genericPhoto] = await Promise.all([
    getArticleBySlug(slug),
    getTeams(),
    getGenericPhoto(),
  ]);
  if (!article) notFound();

  const related = await getRelatedArticles(slug, 3);
  const now = new Date().toISOString();
  const associated = (article.teamIds ?? [])
    .map((id) => teams.find((t) => t.id === id))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <article className="animate-fade-in">
      <Link
        href="/news"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 transition-colors hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to News
      </Link>

      <div className="mx-auto max-w-3xl">
        <Badge variant="accent" className="mb-3">
          {article.category}
        </Badge>
        <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-slate-50 sm:text-4xl">
          {article.title}
        </h1>
        {article.subheadline && (
          <p className="mt-3 text-lg leading-relaxed text-slate-300">
            {article.subheadline}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
          <span className="font-semibold text-slate-300">{article.author}</span>
          <span>•</span>
          <span>{formatDate(article.publishedAt)}</span>
        </div>

        {associated.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {associated.map((t) => (
              <span
                key={t.id}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-navy-800 px-2.5 py-1 text-xs font-semibold text-slate-300"
              >
                <TeamLogo team={t} size={16} />
                {t.city} {t.name}
              </span>
            ))}
          </div>
        )}

        <CoverImage
          src={article.imageUrl}
          fallbackSrc={genericPhoto}
          alt={article.title}
          priority
          className="mt-6 aspect-[16/9] w-full rounded-xl border border-white/10"
          gradientFrom="#1e293b"
          gradientTo="#0a0f1e"
        />

        <div className="mt-6 space-y-4 text-[17px] leading-relaxed text-slate-300">
          {article.content.map((paragraph, i) => (
            <div key={i}>
              <p>{paragraph}</p>
              {article.pullQuote && i === 0 && (
                <blockquote className="my-6 border-l-2 border-amber-400 pl-4 font-display text-xl font-bold leading-snug text-slate-100">
                  {article.pullQuote}
                </blockquote>
              )}
            </div>
          ))}
        </div>

        {article.personalityQuotes && article.personalityQuotes.length > 0 && (
          <div className="mt-8 space-y-3 border-t border-white/10 pt-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              What they're saying
            </p>
            {article.personalityQuotes.map((q, i) => (
              <div
                key={i}
                className="flex gap-3 rounded-xl border border-white/10 bg-navy-800 p-4"
              >
                <Avatar
                  name={q.personality}
                  color={colorFromString(q.personality)}
                  size={38}
                />
                <div>
                  <p className="text-sm font-bold text-slate-100">
                    {q.personality}
                  </p>
                  <p className="mt-0.5 flex gap-1.5 text-sm italic leading-relaxed text-slate-300">
                    <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-600" />
                    {q.quote}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {article.tags && article.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2 border-t border-white/10 pt-5">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {related.length > 0 && (
        <section className="mx-auto mt-12 max-w-3xl">
          <SectionHeader title="Related Stories" />
          <div className="space-y-3">
            {related.map((r) => (
              <NewsCard
                key={r.slug}
                article={r}
                now={now}
                variant="compact"
                genericImageUrl={genericPhoto}
              />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
