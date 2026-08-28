import { Home, Newspaper, MessageSquareText, Trophy, type LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** paths that should also mark this item active */
  match: (pathname: string) => boolean;
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Home",
    href: "/",
    icon: Home,
    match: (p) => p === "/",
  },
  {
    label: "News",
    href: "/news",
    icon: Newspaper,
    match: (p) => p === "/news" || p.startsWith("/news/"),
  },
  {
    label: "Social",
    href: "/social",
    icon: MessageSquareText,
    match: (p) => p === "/social" || p.startsWith("/social/"),
  },
  {
    label: "History",
    href: "/history",
    icon: Trophy,
    match: (p) =>
      p === "/history" || p.startsWith("/history/") || p.startsWith("/coaches"),
  },
];
