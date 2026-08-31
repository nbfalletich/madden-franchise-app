import type { Metadata } from "next";
import { MessageSquareText, Sparkles } from "lucide-react";
import {
  getCoaches,
  getLeagueStatus,
  getPersonalitiesByRole,
  getSocialFeed,
  getTeams,
} from "@/lib/data/leagueData";
import { SectionHeader } from "@/components/section-header";
import { PersonalityCard } from "@/components/personality-card";
import { CoachCard } from "@/components/coach-card";
import { SocialPostCard } from "@/components/social-post-card";
import { EmptyState } from "@/components/empty-state";

export const metadata: Metadata = {
  title: "Social",
  description: "The league feed — coaches, personalities, and the Franchise Wire.",
};

export const revalidate = 300;

export default async function SocialPage() {
  const [feed, roleGroups, coaches, teams, status] = await Promise.all([
    getSocialFeed(),
    getPersonalitiesByRole(),
    getCoaches(),
    getTeams(),
    getLeagueStatus(),
  ]);

  const teamById = (id?: string) => teams.find((t) => t.id === id);
  const now = new Date().toISOString();

  return (
    <div className="animate-fade-in">
      <header className="mb-5">
        <h1 className="font-display text-4xl font-extrabold uppercase tracking-tight text-slate-50">
          Social
        </h1>
        <p className="mt-1 text-slate-400">
          The league feed — coaches, the media universe, and the Franchise Wire.
        </p>
      </header>

      <div className="mb-5 flex items-center gap-2 rounded-lg border border-white/10 bg-navy-800 px-3 py-2.5 text-xs text-slate-400">
        <Sparkles className="h-4 w-4 shrink-0 text-slate-500" />
        Read-only. Posts are generated from league events and results.
      </div>

      {feed.length > 0 ? (
        <section className="mb-9 space-y-3">
          {feed.map((post) => (
            <SocialPostCard
              key={post.id}
              post={post}
              now={now}
              team={teamById(post.teamId)}
            />
          ))}
        </section>
      ) : (
        <EmptyState
          icon={MessageSquareText}
          title="The feed is quiet — for now"
          description="Posts will be generated from game results, rivalries, and hot takes. Until then, here's the roster."
          className="mb-9"
        />
      )}

      <section className="mb-9">
        <SectionHeader eyebrow="The League" title="Coach Accounts" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {coaches.map((coach) => (
            <CoachCard
              key={coach.user}
              coach={coach}
              team={teamById(coach.teamId)}
            />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader eyebrow="The Media" title="Personalities" className="mb-4" />
        <div className="space-y-6">
          {roleGroups.map((group) => (
            <div key={group.role}>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                {group.role}
                <span className="ml-2 text-slate-600">{group.people.length}</span>
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {group.people.map((person) => (
                  <PersonalityCard key={person.id} person={person} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-8 text-center text-xs text-slate-600">
        {status.year} · {status.raw}
      </p>
    </div>
  );
}
