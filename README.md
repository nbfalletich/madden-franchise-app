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

## Adding a new data source later (e.g. `NEWS`, `X_POSTS`)

1. Add the tab name to `SheetTab` in `lib/data/seed.ts` (and a snapshot string).
2. Add its interface to `lib/types.ts`.
3. Add a `getX()` mapper in `lib/data/leagueData.ts` — map header-keyed rows to
   the interface, derive/aggregate, resolve references.
4. Consume it via that function from a page. Components already take structured
   props, so most won't change.

`components/news-card.tsx` and `components/news-feed.tsx` are kept, unused, ready
for the planned AI-generated news feed.
