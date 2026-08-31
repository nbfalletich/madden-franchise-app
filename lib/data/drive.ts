/**
 * Google Drive photo linkage.
 *
 * The sheet tabs carry a `DRIVE_ID` column holding a plain number (1, 2, 3…).
 * The Drive folder holds image files named `1.jpg`, `2.png`, … The map here
 * turns that number into a usable image URL.
 *
 * Source resolution (same idea as SHEET_ID):
 *   - If GOOGLE_API_KEY is set, list the folder live via the Drive API and
 *     build the map (cached 5 min). No OAuth — works on a link-shared folder.
 *   - Otherwise (or on any failure) use the committed snapshot
 *     data/generated/driveMap.json, produced by `npm run build:drive-map`.
 *
 * Serving the image needs no key; only the folder listing does.
 */

import snapshot from "@/data/generated/driveMap.json";

/** The user's "My Drive" folder of numbered league photos. Not a secret. */
export const DRIVE_FOLDER_ID =
  process.env.DRIVE_FOLDER_ID?.trim() || "1_avv4iKMne5Zh9SgHYnWC3BNq-0IPzGw";

const REVALIDATE_SECONDS = 300;

/** number -> image URL, plus the special GENERIC_KEY entry for the fallback photo */
export type DriveMap = Record<string, string>;

/** Map key for the file named "Generic" (any extension) — the no-photo fallback. */
export const GENERIC_KEY = "__generic__";

/** Public CDN URL for a Drive file id, sized for our layouts. */
export function driveImageUrl(fileId: string, width = 1600): string {
  return `https://lh3.googleusercontent.com/d/${fileId}=w${width}`;
}

/** "3.jpg" -> "3"; "  12.PNG " -> "12" */
function keyFromFilename(name: string): string {
  return name.trim().replace(/\.[^.]+$/, "").trim();
}

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
}

/** List every image in the folder via the Drive API and build the map. */
export async function fetchDriveMapLive(apiKey: string): Promise<DriveMap> {
  const map: DriveMap = {};
  let pageToken: string | undefined;

  do {
    const url = new URL("https://www.googleapis.com/drive/v3/files");
    url.searchParams.set("q", `'${DRIVE_FOLDER_ID}' in parents and trashed=false`);
    url.searchParams.set("key", apiKey);
    url.searchParams.set("fields", "nextPageToken,files(id,name,mimeType)");
    url.searchParams.set("pageSize", "1000");
    url.searchParams.set("orderBy", "name_natural");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) {
      throw new Error(`Drive list HTTP ${res.status}: ${await res.text()}`);
    }
    const data = (await res.json()) as {
      files?: DriveFile[];
      nextPageToken?: string;
    };

    for (const f of data.files ?? []) {
      if (!f.mimeType?.startsWith("image/")) continue;
      const base = keyFromFilename(f.name);
      if (!base) continue;
      const key = base.toLowerCase() === "generic" ? GENERIC_KEY : base;
      map[key] = driveImageUrl(f.id);
    }
    pageToken = data.nextPageToken;
  } while (pageToken);

  return map;
}

/**
 * The number -> URL map. Live when GOOGLE_API_KEY is set, otherwise the
 * committed snapshot. Never throws.
 */
export async function getDriveMap(): Promise<DriveMap> {
  const apiKey = process.env.GOOGLE_API_KEY?.trim();
  if (!apiKey) return snapshot as DriveMap;
  try {
    return await fetchDriveMapLive(apiKey);
  } catch (err) {
    console.warn(
      "[drive] live listing failed, using committed driveMap.json:",
      (err as Error).message,
    );
    return snapshot as DriveMap;
  }
}

/**
 * Resolve a raw DRIVE_ID cell to its *assigned* photo.
 * Blank / unknown -> undefined (the caller decides whether to use the generic).
 */
export function photoFor(
  driveId: string | undefined,
  map: DriveMap,
): string | undefined {
  const key = (driveId ?? "").trim();
  return key ? map[key] : undefined;
}

/** The generic "no photo assigned" image (Drive file named `Generic`), if present. */
export async function getGenericPhoto(): Promise<string | undefined> {
  return (await getDriveMap())[GENERIC_KEY];
}

export const driveSourceIsLive = Boolean(process.env.GOOGLE_API_KEY?.trim());
