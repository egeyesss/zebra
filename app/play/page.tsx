// TODO: interaction, timer, scoring, check — out of scope until their own sessions
import Link from "next/link";

import { CluePanel } from "@/components/CluePanel";
import { Hud } from "@/components/Hud";
import { PuzzleGrid } from "@/components/PuzzleGrid";
import { TrackBadge } from "@/components/TrackBadge";
import { Wordmark } from "@/components/Wordmark";
import { LAUNCH_DATE, trackForSize } from "@/lib/config";
import { getPool } from "@/lib/data/puzzles";
import { puzzleNumber, selectDailyPuzzle } from "@/lib/data/selection";

export default function PlayPage() {
  const scheduled = selectDailyPuzzle(getPool());
  const puzzle = scheduled ?? getPool()[0];
  const isPreview = scheduled === null;
  const number = puzzleNumber();
  const track = trackForSize(puzzle.size);

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-border flex flex-col items-center gap-2 border-b px-4 py-4">
        <div className="flex w-full items-center justify-between text-sm">
          <Link href="/" className="no-underline">
            <Wordmark />
          </Link>
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
