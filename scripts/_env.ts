/**
 * Side-effect module: load `.env.local` before anything else runs.
 *
 * Import this FIRST (before any other import) in every script, so that
 * ANTHROPIC_API_KEY / SHEET_ID are in `process.env` by the time the data layer
 * and the Anthropic client are evaluated.
 *
 * In CI the real environment variables are passed directly, and there is no
 * `.env.local`, so this is a harmless no-op there.
 */
import path from "node:path";

try {
  process.loadEnvFile(path.join(process.cwd(), ".env.local"));
} catch {
  // no .env.local (e.g. CI) — use the ambient environment
}
