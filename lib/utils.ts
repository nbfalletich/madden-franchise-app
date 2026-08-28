import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Absolute date, e.g. "Oct 12, 2026". Locale-fixed so server and client agree. */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

/** Date + time, e.g. "Oct 12, 2026 · 8:41 PM". */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const date = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(d);
  return `${date} · ${time}`;
}

/**
 * Relative time ("3h", "2d", "Just now").
 *
 * `now` is passed in explicitly (see `LeagueSettings.now`) instead of using
 * `Date.now()` so the value is identical on the server and the client and
 * never causes a hydration mismatch.
 */
export function timeAgo(iso: string, now: string): string {
  const then = new Date(iso).getTime();
  const ref = new Date(now).getTime();
  const diff = Math.max(0, ref - then);

  const min = Math.floor(diff / 60_000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m`;

  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;

  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d`;

  const wk = Math.floor(day / 7);
  if (wk < 5) return `${wk}w`;

  return formatDate(iso);
}

export function recordString(w: number, l: number, t: number): string {
  return t > 0 ? `${w}-${l}-${t}` : `${w}-${l}`;
}

export function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function initials(name: string): string {
  return name
    .replace(/[^a-zA-Z ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

/** Pick black or white text for a given background. Non-hex inputs default to white. */
export function readableTextColor(hex: string): string {
  if (!/^#?[0-9a-fA-F]{6}$/.test(hex.trim())) return "#ffffff";
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#0a0f1e" : "#ffffff";
}

export function compactNumber(n: number): string {
  if (n < 1000) return String(n);
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['".]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** "NATHAN" -> "Nathan", "MEL KIPER JR." -> "Mel Kiper Jr." */
export function titleCase(input: string): string {
  return input
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0]!.toUpperCase() + w.slice(1))
    .join(" ");
}

/** Parse "12-5" / "12-4-1" into wins/losses/ties. Blank => zeros. */
export function parseRecord(record?: string): {
  wins: number;
  losses: number;
  ties: number;
} {
  const parts = (record ?? "")
    .split("-")
    .map((p) => parseInt(p.trim(), 10));
  return {
    wins: Number.isFinite(parts[0]) ? parts[0]! : 0,
    losses: Number.isFinite(parts[1]) ? parts[1]! : 0,
    ties: Number.isFinite(parts[2]) ? parts[2]! : 0,
  };
}

/** Stable pastel-ish hex from an arbitrary string, for generated avatars. */
export function colorFromString(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 45%, 40%)`;
}

export function toIntOrUndefined(value?: string): number | undefined {
  if (!value) return undefined;
  const n = parseInt(value.trim(), 10);
  return Number.isFinite(n) ? n : undefined;
}
