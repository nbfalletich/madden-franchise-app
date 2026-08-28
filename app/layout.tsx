import type { Metadata, Viewport } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import { AppHeader } from "@/components/app-header";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { getLeagueStatus } from "@/lib/data/leagueData";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const oswald = Oswald({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: {
    default: "Madden 27 Franchise Hub",
    template: "%s · Madden 27 Franchise Hub",
  },
  description:
    "The central hub for our private Madden NFL 27 online franchise — coaches, champions, records, lore, and league history.",
  applicationName: "Madden Franchise Hub",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Franchise Hub",
  },
};

export const viewport: Viewport = {
  themeColor: "#070b17",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const status = await getLeagueStatus();
  const seasonLabel = status.week
    ? `${status.year} · Wk ${status.week}`
    : `${status.year} Season`;

  return (
    <html lang="en" className={`${inter.variable} ${oswald.variable} dark`}>
      <body className="min-h-dvh font-sans">
        <div className="flex min-h-dvh flex-col">
          <AppHeader seasonLabel={seasonLabel} />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-5 pb-[calc(env(safe-area-inset-bottom)+5.5rem)] md:px-8 md:pb-16 md:pt-8">
            {children}
          </main>
        </div>
        <MobileBottomNav />
      </body>
    </html>
  );
}
