# Zebra

A daily competitive logic-grid puzzle — the Einstein ("zebra") riddle in a
Wordle-style daily ritual. One fresh puzzle a day, solved against a hard timer,
shared as a brutally honest stat line.

Built for people who want raw numbers, not mascots: a new grid every day, two
tracks (☕ Coffee 4×4, 🌊 Deep 5×5), commit-based input, and a score that is
simply how many times you changed your mind. Zero overwrites is **Flawless**.

> **Status:** scaffolding. The data layer, theme shell, and page skeletons are
> in place. Solving, the timer, scoring, and share rendering come next. Puzzles
> are currently a single hand-authored mock; the real bank is produced by a
> separate Python CSP generator and dropped in as `data/puzzles/v1.json`.

## Tech stack

- **Next.js 16** (App Router) + **React 19**, TypeScript (strict)
- **Tailwind CSS v4** for styling, dark engineer-noir theme
- **Vitest** for the data-layer tests
- **ESLint** + **Prettier**
- Deploy target: **Vercel**; no accounts in v1 (localStorage only)

## Getting started

Requires the Node version in [`.nvmrc`](./.nvmrc).

```bash
nvm use          # match the pinned Node version
npm install
npm run dev      # http://localhost:3000
```

## Scripts

| Script                 | What it does                 |
| ---------------------- | ---------------------------- |
| `npm run dev`          | Start the dev server         |
| `npm run build`        | Production build             |
| `npm run start`        | Serve the production build   |
| `npm run lint`         | ESLint                       |
| `npm run typecheck`    | `tsc --noEmit`               |
| `npm run format`       | Prettier write               |
| `npm run format:check` | Prettier check (CI-friendly) |
| `npm test`             | Vitest (watch)               |
| `npm run test:run`     | Vitest (single run)          |

## Project structure

```
app/                       App Router routes
  page.tsx                 Today's puzzle (placeholder)
  about/page.tsx           About
  api/share/[id]/route.ts  Share-card endpoint (stub; satori PNG later)
components/                Presentational components (static for now)
lib/
  config.ts                Tracks, reset timezone, launch date
  data/puzzles.ts          Loads + validates the puzzle bundle
  data/selection.ts        Deterministic daily puzzle selection
  storage/streak.ts        localStorage streak hook (stub)
types/puzzle.ts            TS mirror of the generator's export schema
data/puzzles/v1.json       Puzzle bank (currently one mock puzzle)
tests/                     Vitest data-layer tests
```

## How the daily puzzle is chosen

Wordle-style and deterministic: the day's puzzle is a function of the date, so
everyone gets the same puzzle on the same day (the reset is midnight
America/Toronto, which keeps the shared "Zebra #N" number identical for all
players). The pool is consumed sequentially — day _N_ takes index _N_ — so
puzzles never repeat as long as the bank stays ahead of the cursor. See
`lib/data/selection.ts`.

## Data contract

The puzzle JSON is produced by a separate Python CSP generator and is the source
of truth for rendering and grading. `types/puzzle.ts` mirrors that export schema
(version 1.0.1); `lib/data/puzzles.ts` does a light validation pass on load.

## License

[MIT](./LICENSE)
