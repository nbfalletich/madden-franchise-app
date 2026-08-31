import { NextResponse } from "next/server";
import { getRows } from "@/lib/data/sheets";
import { dataSource } from "@/lib/data/leagueData";
import { getDriveMap } from "@/lib/data/drive";
import type { SheetTab } from "@/lib/data/seed";

/**
 * Diagnostic: GET /api/health
 *
 * Tells you whether the app is reading the live Google Sheet or the committed
 * seed snapshot, and how many rows each tab returned right now.
 *
 *   "source": "seed"  -> SHEET_ID is not set (or the fetch failed). Sheet edits
 *                        are NOT reflected. Set SHEET_ID and redeploy.
 *   "source": "live"  -> reading the Google Sheet.
 */
export const dynamic = "force-dynamic";

const TABS: SheetTab[] = [
  "LEAGUE_STATUS",
  "L_CAREERS",
  "CHAMPIONS",
  "AWARDS",
  "HALL_OF_FAME",
  "L_RECORDS",
  "L_EVENTS",
  "X_PERSONALITIES",
];

export async function GET() {
  const rowCounts: Record<string, number | string> = {};
  for (const tab of TABS) {
    try {
      rowCounts[tab] = (await getRows(tab)).length;
    } catch (err) {
      rowCounts[tab] = `error: ${(err as Error).message}`;
    }
  }

  let drivePhotoCount: number | string;
  try {
    drivePhotoCount = Object.keys(await getDriveMap()).length;
  } catch (err) {
    drivePhotoCount = `error: ${(err as Error).message}`;
  }

  return NextResponse.json({
    source: dataSource(), // "live" | "seed"
    sheetIdConfigured: Boolean(process.env.SHEET_ID),
    driveSource: process.env.GOOGLE_API_KEY ? "live" : "snapshot",
    drivePhotoCount,
    checkedAt: new Date().toISOString(),
    rowCounts,
  });
}
