import type { Metadata } from "next";
import { MessageSquareText, Sparkles } from "lucide-react";
import {
  getCoaches,
  getLeagueStatus,
  getPersonalitiesByRole,
  getTeams,
} from "@/lib/data/leagueData";
import { SectionHeader } from "@/components/section-header";
import { PersonalityCard } from "@/components/personality-card";
import { CoachCard } from "@/components/coach-card";
import { EmptyState } from "@/components/empty-state";

export const metadata: Metadata = {
  title: "Social",
  description: "The league's media universe — coaches and personalities.",
};

export const revalidate = 300;

export default async function SocialPage() {
  const [roleGroups, coaches, teams, status] = await Promise.all([
    getPersonalitiesByRole(),
    getCoaches(),
    getTeams(),
    getLeagueStatus(),
  ]);

  const teamById = (id?: string) => teams.find((t) => t.id === id);

  return (
    <div className="animate-fade-in">
      <header className="mb-5">
        <h1 className="font-display text-4xl font-extrabold uppercase tracking-tight text-slate-50">
          Social
        </h1>
        <p className="mt-1 text-slate-400">
          The accounts that will make noise once the season starts — coaches and
          the media universe.
        </p>
      </header>

      <EmptyState
        icon={MessageSquareText}
        title="The feed is quiet — for now"
        description="Posts will be generated from game results, rivalries, and hot takes. Until then, here's the roster."
      />
      <div className="mt-3 mb-8 flex items-center justify-center gap-2 text-xs text-slate-500">
        <Sparkles className="h-3.5 w-3.5" />
        Read-only. Planned: AI-generated posts and replies.
      </div>

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
        <SectionHeader
          eyebrow="The Media"
          title="Personalities"
          className="mb-4"
        />
        <div className="space-y-6">
          {roleGroups.map((group) => (
            <div key={group.role}>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                {group.role}
                <span className="ml-2 text-slate-600">
                  {group.people.length}
                </span>
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
