import Link from "next/link";
import { ArrowRight, Globe, Users } from "lucide-react";
import type { LeagueEvent } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { CoverImage } from "@/components/cover-image";

/**
 * Home-page hero. Highlights the most recent piece of league lore since that's
 * the narrative content that exists pre-season. Swaps to a news hero once the
 * News source is wired.
 */
export function FeaturedEvent({ event }: { event: LeagueEvent }) {
  const Icon = event.scope === "intra" ? Users : Globe;

  return (
    <Link
      href={`/history/lore/${event.slug}`}
      className="group block overflow-hidden rounded-xl border border-white/10 bg-navy-800 shadow-card transition-transform duration-200 hover:-translate-y-0.5"
    >
      <div className="relative">
        <CoverImage
          alt={event.name}
          priority
          className="aspect-[16/10] w-full sm:aspect-[21/9]"
          overlay
          gradientFrom="#1e293b"
          gradientTo="#0a0f1e"
        />
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
          <Badge variant="accent" className="mb-2 inline-flex items-center gap-1">
            <Icon className="h-3 w-3" />
            {event.scope === "outer"
              ? "Outer-League Lore"
              : event.scope === "intra"
                ? "Intra-League Lore"
                : "League Lore"}
            {event.year ? ` · ${event.year}` : ""}
          </Badge>
          <h2 className="font-display text-2xl font-extrabold leading-tight tracking-tight text-white drop-shadow-sm sm:text-3xl">
            {event.name}
          </h2>
        </div>
      </div>
      {event.description && (
        <div className="p-4 sm:p-6">
          <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
            {event.description}
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-amber-400">
            Read the story
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      )}
    </Link>
  );
}
