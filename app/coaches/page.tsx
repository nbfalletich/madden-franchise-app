import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCoaches, getLeagueStatus, getTeams } from "@/lib/data/leagueData";
import { CareerTable } from "@/components/career-table";
import { CoachCard } from "@/components/coach-card";
import { SectionHeader } from "@/components/section-header";

export const metadata: Metadata = {
  title: "Coaches",
  description: "Career records for every coach in the league.",
};

export const revalidate = 300;

export default async function CoachesPage() {
  const [coaches, teams, status] = await Promise.all([
    getCoaches(),
    getTeams(),
    getLeagueStatus(),
  ]);
  const teamById = (id?: string) => teams.find((t) => t.id === id);

  return (
    <div className="animate-fade-in">
      <Link
        href="/history"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 transition-colors hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" />
        League History
      </Link>

      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-400">
          {status.year} · {status.raw}
        </p>
        <h1 className="font-display text-4xl font-extrabold uppercase tracking-tight text-slate-50">
          Coaches
        </h1>
        <p className="mt-1 text-slate-400">
          Career records, updated season by season — no weekly box scores, just
          the ledger.
        </p>
      </header>

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {coaches.map((coach) => (
          <CoachCard
            key={coach.user}
            coach={coach}
            team={teamById(coach.teamId)}
          />
        ))}
      </div>

      <SectionHeader title="Career Ledger" />
      <CareerTable coaches={coaches} teams={teams} />
    </div>
  );
}
