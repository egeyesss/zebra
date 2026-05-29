@AGENTS.md

# Zebra web app — project rules

The Next.js web game. Product brief, mechanics, scoring, share format, and
visual direction live in the Obsidian vault at
`/Users/egeyesilyurt/Documents/Claude Code/Projects/zebra/` (`zebra-brief.md`,
`web-app-design.md`, `launch-handoff.md`). Read those before non-trivial work.

## Boundaries

- This repo is the **web app only**. The puzzle generator is a separate Python
  repo (`csp-generator`); do not add Python tooling here.
- Puzzles come from the generator as a versioned JSON bundle dropped in at
  `data/puzzles/v1.json`. The generator is the source of truth for rendering and
  grading — never hand-edit exported puzzles to "fix" them.

## Data contract

- `types/puzzle.ts` mirrors the generator's export schema (currently 1.0.1).
  Keep it in lockstep: schema minor bump → optional field here, major bump →
  breaking change. `lib/data/puzzles.ts` validates `schema_version` on load.

## Daily selection

- Wordle-style: the day's puzzle is deterministic from the date, sequential
  through the pool, no repeats (see `lib/data/selection.ts`). Reset timezone and
  launch date are in `lib/config.ts`. The same puzzle must resolve for every
  player on a given Toronto day — do not make selection per-client/random.

## Out of scope until their own sessions

Solving/commit interaction, the timer + DNF, scoring/overwrites, note mode, the
"check my work" feature, and satori share-card rendering. Components and routes
that will own these exist as static stubs; flag any TODO you add.

## Conventions

- TypeScript strict. Mono-only typography (JetBrains Mono). Dark theme only.
- Palette lives as CSS variables in `app/globals.css`, exposed to Tailwind via
  `@theme inline` (use `bg-bg`, `text-fg`, `text-accent-green`, etc.).
- Run `npm run lint`, `npm run typecheck`, and `npm run test:run` before
  committing.
