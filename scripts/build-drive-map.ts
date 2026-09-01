/**
 * List the shared Google Drive folder of numbered league photos and write
 * data/generated/driveMap.json  ->  { "1": "<image url>", "2": "...", ... }
 *
 * Both the live app (as a fallback when GOOGLE_API_KEY isn't set on the host)
 * and the news generator read this file.
 *
 *   npm run build:drive-map
 *
 * Needs GOOGLE_API_KEY (Drive API enabled). Optional: DRIVE_FOLDER_ID override.
 */
import "./_env"; // must stay first
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { DRIVE_FOLDER_ID, GENERIC_KEY, fetchDriveMapLive } from "@/lib/data/drive";

const OUT = path.join(process.cwd(), "data", "generated", "driveMap.json");

async function main() {
  const apiKey = process.env.GOOGLE_API_KEY?.trim();
  if (!apiKey) {
    console.warn(
      "GOOGLE_API_KEY not set — keeping the existing data/generated/driveMap.json. " +
        "Set it to (re)build the photo map from the Drive folder.",
    );
    return;
  }

  console.log(`Listing Drive folder ${DRIVE_FOLDER_ID} …`);
  const map = await fetchDriveMapLive(apiKey);

  // numeric keys first (sorted), GENERIC_KEY last
  const keys = Object.keys(map).sort((a, b) => {
    if (a === GENERIC_KEY) return 1;
    if (b === GENERIC_KEY) return -1;
    return Number(a) - Number(b);
  });

  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(
    OUT,
    JSON.stringify(Object.fromEntries(keys.map((k) => [k, map[k]])), null, 2) +
      "\n",
  );
  const shown = keys.map((k) => (k === GENERIC_KEY ? "generic" : k));
  console.log(
    `Wrote ${keys.length} photo(s) [${shown.join(", ")}] to ${path.relative(
      process.cwd(),
      OUT,
    )}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
