import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Globe, Users } from "lucide-react";
import {
  getAllLoreSlugs,
  getLore,
  getLoreEvent,
} from "@/lib/data/leagueData";
import { Badge } from "@/components/ui/badge";
import { CoverImage } from "@/components/cover-image";
import { LoreCard } from "@/components/lore-card";
import { SectionHeader } from "@/components/section-header";

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getAllLoreSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getLoreEvent(slug);
  if (!event) return { title: "Story not found" };
  return { title: event.name, description: event.description };
}

const SCOPE_LABEL: Record<string, string> = {
  outer: "Outer-League Lore",
  intra: "Intra-League Lore",
  other: "League Lore",
};

export default async function LoreDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getLoreEvent(slug);
  if (!event) notFound();

  const others = (await getLore()).filter((l) => l.slug !== slug).slice(0, 3);
  const Icon = event.scope === "intra" ? Users : Globe;

  return (
    <article className="animate-fade-in">
      <Link
        href="/history#lore"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 transition-colors hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to League Lore
      </Link>

      <div className="mx-auto max-w-3xl">
        <Badge variant="accent" className="mb-3 inline-flex items-center gap-1">
          <Icon className="h-3 w-3" />
          {SCOPE_LABEL[event.scope]}
          {event.year ? ` · ${event.year}` : ""}
        </Badge>
        <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-slate-50 sm:text-4xl">
          {event.name}
        </h1>

        <CoverImage
          alt={event.name}
          priority
          className="mt-6 aspect-[16/9] w-full rounded-xl border border-white/10"
          gradientFrom="#1e293b"
          gradientTo="#0a0f1e"
        />

        <div className="mt-6 space-y-4 text-[17px] leading-relaxed text-slate-300">
          <p>{event.description ?? "No detail recorded for this event yet."}</p>
          <p className="text-sm text-slate-500">
            Logged in <span className="font-semibold">L_EVENTS</span> as{" "}
            <span className="font-semibold">{event.type || "lore"}</span>. Fuller
            write-ups can be added to that tab as the story grows.
          </p>
        </div>
      </div>

      {others.length > 0 && (
        <section className="mx-auto mt-12 max-w-3xl">
          <SectionHeader title="More From the Archive" />
          <div className="grid gap-3 sm:grid-cols-2">
            {others.map((e) => (
              <LoreCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
