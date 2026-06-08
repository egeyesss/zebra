# Zebra

A daily competitive logic-grid puzzle — the Einstein ("zebra") riddle as a
Wordle-style daily ritual. One fresh puzzle a day, solved against a hard timer,
shared as a brutally honest stat line.

Built for people who want raw numbers, not mascots.

**→ [zebra.xyz](https://zebra.xyz)**

---

## Screenshots

<table>
  <tr>
    <td align="center"><b>Landing</b></td>
    <td align="center"><b>Puzzle (desktop)</b></td>
  </tr>
  <tr>
    <td><img src="public/screenshots/landing-desktop.png" width="480" alt="Landing page" /></td>
    <td><img src="public/screenshots/puzzle-inplay-desktop.png" width="480" alt="Puzzle in play — desktop" /></td>
  </tr>
  <tr>
    <td align="center"><b>Puzzle (mobile)</b></td>
    <td align="center"></td>
  </tr>
  <tr>
    <td><img src="public/screenshots/puzzle-inplay-mobile.png" width="240" alt="Puzzle in play — mobile" /></td>
    <td></td>
  </tr>
</table>

---

## How it works

Each day delivers one puzzle. Read the clues, fill the grid, commit your
answers. The timer starts when you do and stops when you submit or the clock
runs out.

**Scoring** is a single number: how many times you changed a committed cell.
Zero is **Flawless**. No partial credit, no streaks displayed in-game — just
the raw result.

**Tracks**

| Track | Grid | Timer | Cadence |
|---|---|---|---|
| ☕ Coffee | 4 × 4 | 10 min | Daily |
| 🌊 Deep | 5 × 5 | 25 min | Fridays only |

**Input modes**

- **Commit** — tap a cell, pick a value from the options panel; changing it after counts as an overwrite
- **Eliminate** — cross out values you've ruled out; shown in the options panel with a strikethrough
- **Note** — pin candidate values as small annotations in the corner of the cell
- **Check (1×)** — verify one committed cell against the solution; the result is permanent and highlighted for the rest of the session. The question row is blocked so you can't narrow the answer by elimination.

After the puzzle resolves (win or DNF) a result card shows your time, overwrite
count, and a countdown to the next puzzle. One tap copies a shareable stat line
to the clipboard.

---

## Tech stack

- **Next.js 16** (App Router) + **React 19**, TypeScript strict
- **Tailwind CSS v4**, dark engineer-noir theme (CSS variable palette)
- **Vitest** for data-layer tests
- **ESLint** + **Prettier**
- Deploy target: **Vercel**; no accounts in v1 (localStorage only)

---

## Getting started

Requires the Node version in [`.nvmrc`](./.nvmrc).

```bash
nvm use
npm install
```

**For local development and mobile testing, use the production build.**
Turbopack dev mode breaks React's synthetic event system on iOS Safari
(`onClick` handlers go silent).

```bash
npm run build && npm run start -- --hostname 0.0.0.0
# find your local IP: ipconfig getifaddr en0
# open http://<your-ip>:3000 on your phone
```

---

## Scripts

| Script | What it does |
|---|---|
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run dev` | Dev server (desktop only — see above) |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run format` | Prettier write |
| `npm run format:check` | Prettier check (CI-friendly) |
| `npm test` | Vitest (watch) |
| `npm run test:run` | Vitest (single run) |

---

## Project structure

```
app/
  page.tsx                 Landing page (track selector + how-to-play)
  play/page.tsx            Daily puzzle session
  about/page.tsx           About
  api/share/[id]/route.ts  Share-card endpoint (PNG via satori — upcoming)
components/
  PlaySession.tsx          Session state: timer, commits, scoring, modes
  PuzzleGrid.tsx           4×4 / 5×5 solving grid
  CellPicker.tsx           Value options panel (commit, eliminate, note, check)
  CluePanel.tsx            Clue list — desktop sidebar
  ClueDrawer.tsx           Clue list — mobile bottom drawer
  ResultScreen.tsx         Win / DNF overlay with countdown and share
  Hud.tsx                  Timer, overwrite count, track badge
  ModeSelector.tsx         Commit / Eliminate / Note mode tabs
lib/
  config.ts                Tracks, reset timezone, launch date
  data/puzzles.ts          Loads + validates the puzzle bundle
  data/selection.ts        Deterministic daily puzzle selection
types/puzzle.ts            TS mirror of the generator export schema (1.0.1)
data/puzzles/v1.json       Puzzle bank (versioned JSON from the generator)
tests/                     Vitest data-layer tests
```

---

## Daily selection

Wordle-style and deterministic: the day's puzzle is a function of the date so
everyone gets the same puzzle at the same time. The reset is midnight
`America/Toronto`, which keeps the shared `Zebra #N` number identical for all
players. The pool is consumed sequentially — no repeats as long as the bank
stays ahead of the cursor. See `lib/data/selection.ts`.

---

## Puzzle data contract

Puzzles are produced by a separate Python CSP generator and dropped in as
`data/puzzles/v1.json`. The generator is the source of truth for rendering and
grading — never hand-edit exported puzzles. `types/puzzle.ts` mirrors the
export schema (version 1.0.1); `lib/data/puzzles.ts` validates `schema_version`
on load. Schema minor bumps → optional field; major bumps → breaking change.

---

## License

[MIT](./LICENSE)
