/**
 * Sheet access — one door for every tab.
 *
 * Source resolution:
 *   - If `SHEET_ID` is set, fetch the live tab as CSV from the Google Sheets
 *     "gviz" endpoint (works when the workbook is shared "anyone with the link
 *     can view", or Published to the web). Revalidated every 5 minutes.
 *   - Otherwise, use the committed snapshot in `lib/data/seed.ts`.
 *
 * The rest of the data layer (`leagueData.ts`) only ever calls `getRows(tab)`.
 */

import { SEED, type SheetTab } from "./seed";

const SHEET_ID = process.env.SHEET_ID?.trim();
const REVALIDATE_SECONDS = 300;

function gvizUrl(tab: SheetTab): string {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&headers=1&sheet=${encodeURIComponent(
    tab,
  )}`;
}

/** RFC-4180-ish CSV parser: handles quoted fields, escaped quotes, CRLF, and newlines inside quotes. */
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
      continue;
    }
    if (c === '"') inQuotes = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c !== "\r") {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/** CSV text -> array of `{ HEADER: value }` objects, trimmed, blank rows dropped. */
export function csvToObjects(text: string): Record<string, string>[] {
  const rows = parseCSV(text).filter((r) => r.some((v) => v.trim() !== ""));
  if (rows.length === 0) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = (r[i] ?? "").trim();
    });
    return obj;
  });
}

/**
 * Rows for a tab as plain objects keyed by the sheet's column headers.
 * Falls back to the seed snapshot on any fetch failure so the app never breaks.
 */
export async function getRows(tab: SheetTab): Promise<Record<string, string>[]> {
  if (!SHEET_ID) return csvToObjects(SEED[tab]);

  try {
    const res = await fetch(gvizUrl(tab), {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) throw new Error(`${tab}: HTTP ${res.status}`);
    return csvToObjects(await res.text());
  } catch (err) {
    console.warn(
      `[sheets] live fetch for "${tab}" failed, using seed snapshot:`,
      (err as Error).message,
    );
    return csvToObjects(SEED[tab]);
  }
}

export const isLiveSource = Boolean(SHEET_ID);
