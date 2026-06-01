"use client";

import type { ExportedPuzzle } from "@/types/puzzle";

interface Props {
  puzzle: ExportedPuzzle;
  committed: Record<string, string>;
  selected: { category: string; position: number } | null;
  overwrittenCells: Set<string>;
  justCommitted: string | null;
  onCellSelect: (category: string, position: number) => void;
}

export function PuzzleGrid({
  puzzle,
  committed,
  selected,
  overwrittenCells,
  justCommitted,
  onCellSelect,
}: Props) {
  const categories = Object.keys(puzzle.theme.attributes);
  const positions = Array.from({ length: puzzle.size }, (_, i) => i + 1);
  const templateColumns = `minmax(5rem, auto) repeat(${puzzle.size}, minmax(3rem, 1fr))`;

  return (
    <div
      className="border-border grid gap-px rounded border bg-[var(--border)] text-sm"
      style={{ gridTemplateColumns: templateColumns }}
      aria-label={`${puzzle.size} by ${categories.length} solving grid`}
    >
      {/* Header row: position label + column numbers */}
      <div className="bg-bg-elev text-fg-muted px-2 py-2 capitalize">
        {puzzle.theme.position_label}
      </div>
      {positions.map((pos) => (
        <div
          key={`head-${pos}`}
          className="bg-bg-elev text-fg-muted flex items-center justify-center py-2 tabular-nums"
        >
          {pos}
        </div>
      ))}

      {/* One row per attribute category */}
      {categories.map((category) => (
        <div key={category} className="contents">
          <div className="bg-bg-elev text-fg-muted px-2 py-3 capitalize">
            {category}
          </div>
          {positions.map((pos) => {
            const key = `${category}:${pos}`;
            const value = committed[key];
            const isSelected =
              selected?.category === category && selected?.position === pos;
            const isOverwritten = overwrittenCells.has(key);
            const isFlashing = justCommitted === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => onCellSelect(category, pos)}
                // cell-flash handles background during the 400ms commit animation;
                // bg-bg-elev-2 is the default resting state.
                className={[
                  "aspect-square min-h-12 flex items-center justify-center relative",
                  isFlashing ? "cell-flash" : "bg-bg-elev-2",
                ].join(" ")}
                style={
                  isSelected && !isFlashing
                    ? { boxShadow: "inset 0 0 0 1.5px var(--accent-amber)" }
                    : undefined
                }
                aria-pressed={isSelected}
              >
                {value && (
                  <span className="text-fg text-xs leading-tight text-center px-1 break-all">
                    {value}
                  </span>
                )}
                {isOverwritten && (
                  <span
                    className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: "var(--accent-red)" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
