# Madden 27 Franchise Hub

The central hub for our private **Madden NFL 27** online franchise. Mobile-first,
polished-sports look (ESPN / NFL.com), not an esports vibe.

## Stack

- **Next.js (App Router)** + **TypeScript**
- **Tailwind CSS** + a few hand-rolled shadcn/ui-style primitives (`components/ui`)
- **Lucide** icons
- No database. Content comes from a Google Sheets workbook (or a committed snapshot).
- Deploys to **Vercel** with zero config.

## Run locally

```bash
npm install
npm run dev            # http://localhost:3000
```

With no environment variables the app runs on the committed data snapshot in
`lib/data/seed.ts`.

## Connecting the Google Sheet

1. In the workbook: **Share → General access → Anyone with the link → Viewer**
   (or **File → Share → Publish to web**).
2. Copy the file id from the URL:
   `https://docs.google.com/spreadsheets/d/`**`<THIS PART>`**`/edit`
3. Set it as an env var (locally in `.env.local`, on Vercel in Project Settings):

   ```
   SHEET_ID=1AbC...XyZ
   ```

4. Redeploy. The app now reads each tab live as CSV from the Google "gviz"
   endpoint, cached for 5 minutes (`export const revalidate = 300` on each page).
   Editing a cell in the Sheet updates the site within a few minutes — no
   redeploy needed.

No API key and no OAuth. See `.env.example`.

**Check which source is live:** open `/api/health`. `"source": "seed"` means `SHEET_ID`
is not set (or the fetch failed) and sheet edits are **not** reflected; `"source":
"live"` means it's reading the Google Sheet. It also shows the row count per tab.

Set `SHEET_ID` in **both** places independently — they don't share config:
- **Local:** a `.env.local` file in the project root with `SHEET_ID=...` (restart `npm run dev`).
- **Vercel:** Project → Settings → Environment Variables, then redeploy.

`.env.local` is also read by `npm run generate:*` (via `scripts/_env.ts`).

### Expected tabs

Tab names must match exactly. Column headers are read from row 1.

| Tab | Columns | Powers |
|---|---|---|
| `LEAGUE_STATUS` | `STATUS_DATE` | the season/phase banner + app clock |
| `L_CAREERS` | `USER, COACH_NAME, YEAR, RECORD, TEAM, RESULT` | coaches + career ledger (`/coaches`) |
| `CHAMPIONS` | `YEAR, GAME, WINNER, GAME_DESCRIPTION` | History → Champions |
| `AWARDS` | `YEAR, AWARD, WINNER` | History → Awards + home "Up For Grabs" |
| `HALL_OF_FAME` | `NAME, INDUCTION_YEAR` | History → Hall of Fame |
| `L_RECORDS` | `YEAR, RECORD, PLAYER, AMOUNT` | History → Record Book |
| `L_EVENTS` | `YEAR, EVENT_NAME, EVENT_TYPE, EVENT_DESCRIPTION` | History → Lore + home hero + `/history/lore/[slug]` |
| `X_PERSONALITIES` | `PERSONALITY, PERSONALITY_TYPE, START_YEAR, END_YEAR` | Social → media roster |

Notes:
- `L_EVENTS.EVENT_TYPE` is matched loosely: contains `OUTER` → outer-league,
  `INTRA` → intra-league.
- `CHAMPIONS.GAME` is matched loosely: contains `AFC` / `NFC` / `SUPER BOWL`.
- `L_CAREERS.RESULT` drives playoff / championship counts — text like
  `Won Super Bowl` or `Lost Divisional Round`. Blank = regular season only.
- Empty tabs render friendly empty states, not blank pages.

## Where things live

```
lib/
  types.ts              domain models (Team, Coach, SeasonChampions, LeagueEvent, ...)
  teams.ts              pure team-name resolver (client-safe)
  data/
    seed.ts             committed CSV snapshot of every tab (fallback source)
    sheets.ts           getRows(tab): live CSV fetch OR seed, + CSV parser
    nflTeams.ts         all 32 NFL teams (colors, divisions) + who controls which
    leagueData.ts       >>> the data layer <<< every page/component reads from here
app/
  page.tsx              HOME
  news/page.tsx         NEWS (placeholder — AI-generated later)
  social/page.tsx       SOCIAL (coach + personality roster; feed placeholder)
  history/page.tsx      HISTORY (champions / awards / HOF / records / lore / careers)
  history/lore/[slug]/  lore detail
  coaches/[user]/       per-coach career page
components/              app-header, mobile-bottom-nav, season-banner, coach-card,
                         champion-card, award-list, record-card, lore-card,
                         career-table, personality-card, featured-event, ...
```

## Google Drive photos (`DRIVE_ID`)

Each tab can carry a `DRIVE_ID` column holding a plain number. A shared Drive
folder holds image files named `1.jpg`, `2.png`, … The number links the row to
its photo, which then appears on the news story / lore card / champion card / etc.

- `scripts/build-drive-map.ts` lists the folder via the Drive API and writes
  `data/generated/driveMap.json` = `{ "1": "<url>", "2": "…" }`.
- `lib/data/drive.ts` resolves `DRIVE_ID` → URL. If `GOOGLE_API_KEY` is set it
  lists the folder **live** (cached 5 min); otherwise it uses the committed
  `driveMap.json`.
- Serving the image needs no key (it's `https://lh3.googleusercontent.com/d/<id>`);
  only the folder listing does.

### Setup

1. Enable the **Google Drive API** in Google Cloud and make an **API key**.
2. `GOOGLE_API_KEY=...` in `.env.local`, in the GitHub Actions secrets, and
   (optional, for near-live photos) in Vercel env vars.
3. Folder id is hardcoded in `lib/data/drive.ts`; override with `DRIVE_FOLDER_ID`.
4. Put the number in the `DRIVE_ID` cell for the row you want a photo on.

### The `Generic` photo + the feature slot

- A Drive file named **`Generic`** (any extension, no number) is the leaguewide
  "no photo assigned" fallback. Any story/card/lore item without its own
  `DRIVE_ID` shows `Generic` instead of the gradient. (If `Generic` itself is
  missing or fails to load, it falls back to the gradient.)
- The **home-page feature story** only ever uses a story that has a *real,
  assigned* `DRIVE_ID` photo — the `Generic` image never qualifies a story for
  the top slot. If nothing is photo-tagged yet, the hero shows an empty state.

Missing / unknown numbers fall back to `Generic`, then the gradient.
`/api/health` shows `driveSource` and `drivePhotoCount` (the generic counts).

## AI-generated news & social

News articles and social posts are **generated from the sheet data**, not hand-written
and not created at request time. The generator reads the same league data through
`lib/data/leagueData.ts`, calls Claude once per story-worthy fact, and writes the
results to `data/generated/news.json` / `data/generated/social.json`, which the app
serves as static content.

```
sheet data ──► lib/ai/storyCandidates.ts   (one candidate per event/champion/award/record/career,
                                             each with a stable sourceKey for dedupe)
           ──► lib/ai/generateStory.ts      (Claude, structured output → NewsArticle)
           ──► lib/ai/generateSocial.ts     (Claude → a short thread of SocialPosts)
scripts/generate-news.ts / generate-social.ts   orchestrate + merge + write the JSON
```

### Run it

```bash
# put your key in .env.local (gitignored):  ANTHROPIC_API_KEY=sk-ant-...
npm run generate                          # news + social, new stories only
npm run generate:news -- --only <slug>    # rewrite specific story/thread(s), comma-separated
npm run generate:news -- --force          # rewrite everything (old text stays in git)
npm run generate:news -- --limit 3        # cap a run
```

Optional env: `NEWS_MODEL` / `SOCIAL_MODEL` (default `claude-opus-5`),
`NEWS_EFFORT` (default `medium`), `SOCIAL_EFFORT` (default `low`).

**News** is written short and dramatic — league canon, not box scores (feature 3–5
short paragraphs, recap 2–3, brief 1–2).

**Social:** one call per story generates a post from **every active personality**.
Accounts whose `X_PERSONALITIES.PERSONALITY_TYPE` is **`PUBLIC FIGURE`** post
*off-topic* — something plausible for that real person's public life (politics,
business, feuds), never about the league. Everyone else reacts in character, and
famously provocative figures are written to actually be provocative. `DONALD TRUMP`
is seeded as `PUBLIC FIGURE`; set the type on any others you want to behave that way.

### Append-only archive

`data/generated/*.json` is **write-once, never pruned**:

- A new source row → a new story. That's the only thing a normal run does.
- **Deleting** a source row from the sheet does **not** remove the story it produced.
- **Editing** a source row does **not** change or regenerate an existing story — a
  recap reflects how things read when it was written. Use `--only <slug>` (or
  `--force`) if you deliberately want to rewrite one.
- Slugs are stable, so `/news/<slug>` URLs never break.
- The files are committed by the Action, so git history holds every prior version too.

### Automate it

`.github/workflows/generate-content.yml` runs every 6 hours (and on demand via
"Run workflow"), regenerates, and commits any changes — Vercel redeploys on the push.
Add two repo secrets under **Settings → Secrets and variables → Actions**:

- `ANTHROPIC_API_KEY`
- `SHEET_ID` (same value as the Vercel env var)

The `@anthropic-ai/sdk` / `zod` deps are devDependencies and are never imported by the
Next app — only by the scripts.

## Adding a new data source later (e.g. `NEWS`, `X_POSTS`)

1. Add the tab name to `SheetTab` in `lib/data/seed.ts` (and a snapshot string).
2. Add its interface to `lib/types.ts`.
3. Add a `getX()` mapper in `lib/data/leagueData.ts` — map header-keyed rows to
   the interface, derive/aggregate, resolve references.
4. Consume it via that function from a page. Components already take structured
   props, so most won't change.

`components/news-card.tsx` and `components/news-feed.tsx` are kept, unused, ready
for the planned AI-generated news feed.
