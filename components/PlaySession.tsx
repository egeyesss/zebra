"use client";

import { useState } from "react";
import Link from "next/link";

import type { ExportedPuzzle, Track } from "@/types/puzzle";
import { LAUNCH_DATE } from "@/lib/config";

import { CellPicker } from "./CellPicker";
import { ClueDrawer } from "./ClueDrawer";
import { CluePanel } from "./CluePanel";
import { Hud } from "./Hud";
import { PuzzleGrid } from "./PuzzleGrid";
import { TrackBadge } from "./TrackBadge";
import { Wordmark } from "./Wordmark";

interface Props {
  puzzle: ExportedPuzzle;
  isPreview: boolean;
  number: number | null;
  track: Track;
}

function checkSolved(
  committed: Record<string, string>,
  puzzle: ExportedPuzzle,
): boolean {
  const categories = Object.keys(puzzle.theme.attributes);
  return categories.every((cat) =>
    Array.from({ length: puzzle.size }, (_, i) => i + 1).every((pos) => {
      const val = committed[`${cat}:${pos}`];
      const correct = puzzle.solution.assignments[cat]?.[pos - 1];
      return val !== undefined && val === correct;
    }),
  );
}

export function PlaySession({ puzzle, isPreview, number, track }: Props) {
  // committed[`${category}:${position}`] = the value the player entered (1-indexed position)
  const [committed, setCommitted] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<{
    category: string;
    position: number;
  } | null>(null);
  // cells that have been overwritten at least once (show red dot)
  const [overwrittenCells, setOverwrittenCells] = useState<Set<string>>(
    new Set(),
  );
  const [overwrites, setOverwrites] = useState(0);
  // key of the cell that just received a commit; cleared after 400ms for the flash animation
  const [justCommitted, setJustCommitted] = useState<string | null>(null);
  // TODO: wire solved → result-screen overlay (result-screen session)
  const [solved, setSolved] = useState(false);

  function handleCellSelect(category: string, position: number) {
    if (solved) return;
    // tapping the already-selected cell deselects (closes picker)
    setSelected((prev) =>
      prev?.category === category && prev?.position === position
        ? null
        : { category, position },
    );
  }

  function handleCommit(value: string) {
    if (!selected) return;
    const key = `${selected.category}:${selected.position}`;
    const existing = committed[key];

    if (existing !== undefined && existing !== value) {
      setOverwrites((n) => n + 1);
      setOverwrittenCells((prev) => new Set([...prev, key]));
    }

    const next = { ...committed, [key]: value };
    setCommitted(next);
    setSelected(null);
    setJustCommitted(key);
    // clear only if nothing else committed since this timeout was scheduled
    setTimeout(
      () => setJustCommitted((prev) => (prev === key ? null : prev)),
      400,
    );

    if (checkSolved(next, puzzle)) {
      setSolved(true);
      // TODO: replace with full result-screen overlay (result-screen session)
    }
  }

  const pickerValues = selected
    ? puzzle.theme.attributes[selected.category]
    : null;
  const pickerCurrentValue = selected
    ? committed[`${selected.category}:${selected.position}`]
    : undefined;

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
        <Hud overwrites={overwrites} />
        <div className="text-fg-muted flex items-center gap-3 text-sm">
          {number !== null && <span className="tabular-nums">#{number}</span>}
          <TrackBadge track={track} />
        </div>
      </header>

      {isPreview && (
        <p className="text-accent-amber bg-bg-elev px-4 py-2 text-center text-sm">
          Preview — no puzzle is scheduled yet (launch {LAUNCH_DATE}). Showing
          a sample.
        </p>
      )}

      {/*
       * TODO: replace with full result-screen overlay when that session ships.
       * Bare "Solved." banner keeps the interaction loop testable end-to-end
       * without blocking on the result screen.
       */}
      {solved && (
        <div
          className="border-b px-4 py-3 text-center text-sm"
          style={{
            backgroundColor: "rgba(109,191,109,0.08)",
            borderColor: "rgba(109,191,109,0.25)",
          }}
        >
          <span style={{ color: "var(--accent-green)" }}>Solved.</span>
        </div>
      )}

      {/*
       * pt-4 px-4: normal content padding.
       * pb-28 (7rem): reserves space on mobile for the fixed bottom UI —
       *   picker (~3.5rem) + drawer handle (3.5rem). lg:pb-4 resets on desktop
       *   since the picker is inside the flow there.
       */}
      <main className="grid flex-1 gap-6 pt-4 px-4 pb-28 lg:pb-4 lg:grid-cols-[3fr_1fr]">
        <section className="flex items-start justify-center">
          <div className="flex w-full max-w-2xl flex-col gap-3">
            <PuzzleGrid
              puzzle={puzzle}
              committed={committed}
              selected={selected}
              overwrittenCells={overwrittenCells}
              justCommitted={justCommitted}
              onCellSelect={handleCellSelect}
            />

            {/* Desktop picker: flows below the grid when a cell is selected */}
            {pickerValues && (
              <div className="hidden lg:block">
                <CellPicker
                  values={pickerValues}
                  currentValue={pickerCurrentValue}
                  onCommit={handleCommit}
                />
              </div>
            )}
          </div>
        </section>

        <aside className="border-border bg-bg-elev hidden flex-col gap-3 rounded border p-4 lg:flex lg:max-h-[70vh]">
          <h2 className="text-fg-muted text-xs tracking-widest uppercase">
            Clues
          </h2>
          <CluePanel clues={puzzle.clues} />
        </aside>
      </main>

      {/* Mobile picker: fixed just above the drawer handle */}
      {pickerValues && (
        <div
          className="fixed inset-x-0 z-50 px-3 py-2 lg:hidden"
          style={{ bottom: "3.5rem" }}
        >
          <CellPicker
            values={pickerValues}
            currentValue={pickerCurrentValue}
            onCommit={handleCommit}
          />
        </div>
      )}

      {/* Mobile clue drawer (hidden on lg+) */}
      <ClueDrawer clues={puzzle.clues} />
    </div>
  );
}
