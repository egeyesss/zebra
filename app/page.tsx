import Link from "next/link";

import { CluePanel } from "@/components/CluePanel";
import { Hud } from "@/components/Hud";
import { PuzzleGrid } from "@/components/PuzzleGrid";
import { TrackBadge } from "@/components/TrackBadge";
import { Wordmark } from "@/components/Wordmark";
import { LAUNCH_DATE, trackForSize } from "@/lib/config";
import { getPool } from "@/lib/data/puzzles";
import { puzzleNumber, selectDailyPuzzle } from "@/lib/data/selection";

/**
 * Today's puzzle — PLACEHOLDER.
 *
 * Wires the data layer to the layout shell: it picks the scheduled puzzle and
 * renders the grid + clue panel in the design's grid-dominant layout. There is
 * no interaction, timer, or scoring — those come later. Before launch (or once
 * the bank is exhausted) nothing is scheduled, so we fall back to previewing the
 * first pool puzzle just so the shell is visible during development.
 */
export default function HomePage() {
  const scheduled = selectDailyPuzzle(getPool());
  const puzzle = scheduled ?? getPool()[0];
  const isPreview = scheduled === null;
  const number = puzzleNumber();
  const track = trackForSize(puzzle.size);

  return (
    <div className="flex flex-1 flex-col">
      {/* Thin header: wordmark + timer/overwrites, doesn't steal grid height. */}
      <header className="border-border flex flex-col items-center gap-2 border-b px-4 py-4">
        <div className="flex w-full items-center justify-between text-sm">
          <Wordmark />
          <Link href="/about" className="text-fg-muted hover:text-fg">
            about
          </Link>
        </div>
        <Hud />
        <div className="text-fg-muted flex items-center gap-3 text-sm">
          {number !== null && <span className="tabular-nums">#{number}</span>}
          <TrackBadge track={track} />
        </div>
      </header>

      {isPreview && (
        <p className="text-accent-amber bg-bg-elev px-4 py-2 text-center text-sm">
          Preview — no puzzle is scheduled yet (launch {LAUNCH_DATE}). Showing a
          sample.
        </p>
      )}

      {/* Grid dominant on the left, clue panel narrow on the right (desktop). */}
      <main className="grid flex-1 gap-6 p-4 lg:grid-cols-[3fr_1fr]">
        <section className="flex items-start justify-center">
          <div className="w-full max-w-2xl">
            <PuzzleGrid puzzle={puzzle} />
          </div>
        </section>

        <aside className="border-border bg-bg-elev flex flex-col gap-3 rounded border p-4 lg:max-h-[70vh]">
          <h2 className="text-fg-muted text-xs tracking-widest uppercase">
            Clues
          </h2>
          <CluePanel clues={puzzle.clues} />
        </aside>
      </main>
    </div>
  );
}
