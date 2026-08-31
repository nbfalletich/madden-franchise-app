import { BadgeCheck, Heart, MessageCircle, Repeat2, Share } from "lucide-react";
import type { SocialPost, Team } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { cn, compactNumber, timeAgo } from "@/lib/utils";

const KIND_LABEL: Record<SocialPost["authorKind"], string> = {
  coach: "Coach",
  personality: "Media",
  team: "Team",
  league: "League Office",
};

/**
 * Read-only social post (AI-generated). Shows reply context, media badge, and a
 * non-interactive engagement row.
 */
export function SocialPostCard({
  post,
  now,
  team,
  compact = false,
}: {
  post: SocialPost;
  now: string;
  team?: Team;
  compact?: boolean;
}) {
  return (
    <article
      className={cn(
        "rounded-xl border border-white/10 bg-navy-800 shadow-card",
        compact ? "p-3.5" : "p-4 sm:p-5",
      )}
    >
      {post.replyTo && (
        <p className="mb-1.5 pl-1 text-xs text-slate-500">
          Replying to{" "}
          <span className="font-semibold text-slate-400">@{post.replyTo}</span>
        </p>
      )}

      <div className="flex gap-3">
        <Avatar
          name={post.authorName}
          color={post.avatarColor}
          size={compact ? 38 : 44}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm">
              <span className="font-bold text-slate-50">{post.authorName}</span>
              {post.verified && (
                <BadgeCheck className="h-4 w-4 shrink-0 text-amber-400" />
              )}
              <span className="text-slate-500">@{post.authorHandle}</span>
              {team && (
                <span
                  className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-200"
                  style={{ backgroundColor: `${team.primaryColor}33` }}
                >
                  {team.abbreviation}
                </span>
              )}
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                · {KIND_LABEL[post.authorKind]}
              </span>
            </div>
            <span className="shrink-0 text-xs text-slate-500">
              {timeAgo(post.createdAt, now)}
            </span>
          </div>

          <p className="mt-1 whitespace-pre-line text-[15px] leading-relaxed text-slate-200">
            {post.content}
          </p>

          {!compact && (
            <div className="mt-3 flex max-w-xs items-center justify-between text-slate-500">
              <span className="inline-flex items-center gap-1.5 text-xs">
                <MessageCircle className="h-4 w-4" />
                {compactNumber(post.comments)}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs">
                <Repeat2 className="h-4 w-4" />
                {compactNumber(post.reposts)}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs">
                <Heart className="h-4 w-4" />
                {compactNumber(post.likes)}
              </span>
              <Share className="h-4 w-4" />
            </div>
          )}

          {compact && (
            <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <Heart className="h-3.5 w-3.5" />
                {compactNumber(post.likes)}
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5" />
                {compactNumber(post.comments)}
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
