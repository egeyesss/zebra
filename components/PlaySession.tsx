"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import type { ExportedPuzzle, Track } from "@/types/puzzle";
import { LAUNCH_DATE, TRACKS } from "@/lib/config";

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

// Build "Who drinks latte?" from puzzle.question + the category's predicate template.
function buildQuestionText(puzzle: ExportedPuzzle): string | null {
  if (!puzzle.question) return null;
  const [category, value] = puzzle.question;
  const descriptor = puzzle.theme.descriptors[category];
  if (descriptor && typeof descriptor !== "string" && descriptor.predicate) {
    return `Who ${descriptor.predicate.replace("{value}", value)}?`;
  }
  if (descriptor && typeof descriptor !== "string" && descriptor.subject) {
    return `Who is ${descriptor.subject.replace("{value}", value)}?`;
  }
  return `Who has ${value}?`;
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
  const [started, setStarted] = useState(false);
  const [dnf, setDnf] = useState(false);
  const [committed, setCommitted] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<{
    category: string;
    position: number;
  } | null>(null);
  const [overwrittenCells, setOverwrittenCells] = useState<Set<string>>(
    new Set(),
  );
  const [overwrites, setOverwrites] = useState(0);
  const [justCommitted, setJustCommitted] = useState<string | null>(null);
  // TODO: wire solved → result-screen overlay (result-screen session)
  const [solved, setSolved] = useState(false);

  const { hardCapSeconds } = TRACKS[track];

  function handleDnf() {
    setDnf(true);
    setSelected(null);
  }

  const questionText = buildQuestionText(puzzle);

  // Start with unshuffled attributes (deterministic for SSR — avoids hydration
  // mismatch that would break the component on iOS Safari). Shuffle only after
  // hydration is complete, in a useEffect.
  const [shuffledAttributes, setShuffledAttributes] = useState<
    Record<string, string[]>
  >(() => ({ ...puzzle.theme.attributes }));

  // Escape key closes the about modal when it's open.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && window.location.hash === "#zebra-about") {
        window.location.hash = "_";
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const result: Record<string, string[]> = {};
    for (const [cat, vals] of Object.entries(puzzle.theme.attributes)) {
      const arr = [...vals];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      result[cat] = arr;
    }
    // requestAnimationFrame satisfies the react-hooks/set-state-in-effect rule
    // while still running before the first frame the user sees.
    requestAnimationFrame(() => setShuffledAttributes(result));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleCellSelect(category: string, position: number) {
    if (!started || solved || dnf) return;
    setSelected((prev) =>
      prev?.category === category && prev?.position === position
        ? null
        : { category, position },
    );
  }

  function handleCommit(value: string) {
    if (!selected || !started || dnf || solved) return;
    const key = `${selected.category}:${selected.position}`;
    const existing = committed[key];

    if (existing !== undefined && existing !== value) {
      setOverwrites((n) => n + 1);
      setOverwrittenCells((prev) => new Set([...prev, key]));
    }

    // Enforce row uniqueness: clear any other cell in the same row that has this value.
    const evictKey = Object.keys(committed).find(
      (k) =>
        committed[k] === value &&
        k.startsWith(`${selected.category}:`) &&
        k !== key,
    );

    const next: Record<string, string> = { ...committed, [key]: value };
    if (evictKey) {
      delete next[evictKey];
      setOverwrittenCells((prev) => {
        const copy = new Set(prev);
        copy.delete(evictKey);
        return copy;
      });
    }

    setCommitted(next);
    setSelected(null);
    setJustCommitted(key);
    setTimeout(
      () => setJustCommitted((prev) => (prev === key ? null : prev)),
      400,
    );

    if (checkSolved(next, puzzle)) {
      setSolved(true);
      // TODO: replace with full result-screen overlay (result-screen session)
    }
  }

  const pickerRef = useRef<HTMLDivElement>(null);

  // Scroll the desktop picker into view when a cell is selected.
  // offsetParent is null for display:none elements, so this is a no-op on mobile.
  useEffect(() => {
    if (!selected || !pickerRef.current) return;
    if (pickerRef.current.offsetParent !== null) {
      pickerRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selected]);

  const pickerValues = selected ? shuffledAttributes[selected.category] : null;
  const pickerCurrentValue = selected
    ? committed[`${selected.category}:${selected.position}`]
    : undefined;

  return (
    <div className="flex flex-1 flex-col">
      {/*
       * About modal — CSS :target pattern (zero JS, iOS Safari proof).
       * The Tailwind optimizer drops :target rules from globals.css, so the
       * toggle rule lives in a <style> tag that is never post-processed.
       */}
      <style>{`#zebra-about:target { display: flex !important; }`}</style>
      <div
        id="zebra-about"
        className="hidden fixed inset-0 z-50 items-center justify-center p-6"
        style={{ background: "rgba(10,8,6,0.85)" }}
      >
        <div
          className="relative z-10 w-full rounded-[10px] px-7 py-7"
          style={{
            maxWidth: "440px",
            background: "var(--bg-elev)",
            boxShadow:
              "inset 0 0 0 1px var(--border), 0 30px 80px rgba(0,0,0,0.6)",
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="mb-5 flex items-center justify-between">
            <span
              className="text-fg-muted"
              style={{ fontSize: "11px", letterSpacing: "0.25em" }}
            >
              ABOUT
            </span>
            <a
              href="#_"
              className="text-fg-muted hover:text-fg px-1 text-sm"
              style={{ textDecoration: "none" }}
            >
              esc ×
            </a>
          </div>
          <div className="flex flex-col gap-4 text-sm leading-relaxed">
            <p>
              Zebra is a daily logic-grid puzzle — the Einstein riddle, one
              fresh grid every day. Read the clues, deduce who sits where, and
              commit each cell against the clock.
            </p>
            <p>
              Two tracks:{" "}
              <span className="text-fg-muted">☕ Coffee</span> is a 4×4
              warm-up, <span className="text-fg-muted">🌊 Deep</span> is a 5×5
              for when you mean it. Every commit is final and counts; your score
              is the number of times you changed your mind. Zero overwrites is{" "}
              <span className="text-accent-green">Flawless</span>.
            </p>
            <p>
              One puzzle a day, the same for everyone, resetting at midnight
              Toronto time. No accounts, no hints beyond a single check, no live
              correctness feedback. Just you and the grid.
            </p>
          </div>
        </div>
        <a
          href="#_"
          className="absolute inset-0 z-0"
          aria-label="Close about"
        />
      </div>

      <header className="border-border flex flex-col items-center gap-2 border-b px-4 py-4">
        <div className="flex w-full items-center justify-between text-sm">
          <Link href="/" className="no-underline">
            <Wordmark />
          </Link>
          <a
            href="#zebra-about"
            className="text-fg-muted hover:text-fg"
            style={{ textDecoration: "none" }}
          >
            about
          </a>
        </div>
        <Hud
          started={started}
          solved={solved}
          dnf={dnf}
          hardCapSeconds={hardCapSeconds}
          overwrites={overwrites}
          onDnf={handleDnf}
        />
        <div className="text-fg-muted flex items-center gap-3 text-sm">
          {number !== null && <span className="tabular-nums">#{number}</span>}
          <TrackBadge track={track} />
        </div>
        {questionText && <p className="text-fg text-sm">{questionText}</p>}
      </header>

      {isPreview && (
        <p className="text-accent-amber bg-bg-elev px-4 py-2 text-center text-sm">
          Preview — no puzzle is scheduled yet (launch {LAUNCH_DATE}). Showing
          a sample.
        </p>
      )}

      {/* TODO: replace both banners with the full result-screen overlay (result-screen session). */}
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
      {dnf && !solved && (
        <div
          className="border-b px-4 py-3 text-center text-sm"
          style={{
            backgroundColor: "rgba(207,84,84,0.08)",
            borderColor: "rgba(207,84,84,0.25)",
          }}
        >
          {/* TODO: replace with full result-screen overlay (result-screen session) */}
          <span style={{ color: "var(--accent-red)" }}>DNF.</span>
        </div>
      )}

      <main className="flex flex-1 flex-col items-center gap-6 pt-4 px-4 pb-28 lg:flex-row lg:items-start lg:justify-center lg:pb-4">
        <div className="flex w-full max-w-2xl flex-shrink-0 flex-col gap-3">
          {!started ? (
            <div className="flex flex-col items-center gap-8 px-4 py-16">
              {questionText && (
                <p
                  className="text-fg text-center"
                  style={{ fontSize: "22px", lineHeight: 1.5 }}
                >
                  {questionText}
                </p>
              )}
              <div className="flex flex-col items-center gap-4">
                <p className="text-fg-muted text-center text-sm">
                  {`${Math.floor(hardCapSeconds / 60)}:00 on the clock — timer starts when you do.`}
                </p>
                <button
                  onClick={() => setStarted(true)}
                  className="rounded px-8 py-2.5 text-sm font-medium"
                  style={{
                    background: "transparent",
                    border: "1.5px solid var(--accent-green)",
                    color: "var(--accent-green)",
                    cursor: "pointer",
                    letterSpacing: "0.12em",
                  }}
                >
                  start
                </button>
              </div>
            </div>
          ) : (
            <>
              <PuzzleGrid
                puzzle={puzzle}
                committed={committed}
                selected={selected}
                overwrittenCells={overwrittenCells}
                justCommitted={justCommitted}
                onCellSelect={handleCellSelect}
              />

              {pickerValues && (
                <div ref={pickerRef} className="hidden lg:block">
                  <CellPicker
                    values={pickerValues}
                    currentValue={pickerCurrentValue}
                    onCommit={handleCommit}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {started && (
          <aside className="border-border bg-bg-elev hidden w-64 flex-shrink-0 flex-col gap-3 rounded border p-4 lg:flex lg:max-h-[70vh]">
            <h2 className="text-fg-muted text-xs tracking-widest uppercase">
              Clues
            </h2>
            <CluePanel clues={puzzle.clues} />
          </aside>
        )}
      </main>

      {started && !dnf && pickerValues && (
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

      {started && <ClueDrawer clues={puzzle.clues} />}
    </div>
  );
}
