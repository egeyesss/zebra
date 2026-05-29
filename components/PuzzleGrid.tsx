import type { ExportedPuzzle } from "@/types/puzzle";

/**
 * The solving grid — STATIC placeholder.
 *
 * Lays out one row per attribute category and one column per position (seat /
 * house / desk), the surface the player will eventually commit values into.
 * Cells are empty: there is no cell selection, picker, commit, or note mode
 * yet. This exists so the layout shell and theming can be seen end-to-end.
 */
export function PuzzleGrid({ puzzle }: { puzzle: ExportedPuzzle }) {
  const categories = Object.keys(puzzle.theme.attributes);
  const positions = Array.from({ length: puzzle.size }, (_, i) => i + 1);

  // One label column plus one column per position.
  const templateColumns = `minmax(5rem, auto) repeat(${puzzle.size}, minmax(3rem, 1fr))`;

  return (
    <div
      className="border-border grid gap-px rounded border bg-[var(--border)] text-sm"
      style={{ gridTemplateColumns: templateColumns }}
      aria-label={`${puzzle.size} by ${categories.length} solving grid`}
    >
      {/* Header row: empty corner + position numbers. */}
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

      {/* One row per category, with empty (uncommitted) cells. */}
      {categories.map((category) => (
        <div key={category} className="contents">
          <div className="bg-bg-elev text-fg-muted px-2 py-3 capitalize">
            {category}
          </div>
          {positions.map((pos) => (
            <div
              key={`${category}-${pos}`}
              className="bg-bg-elev-2 aspect-square min-h-12"
            />
          ))}
        </div>
      ))}
    </div>
  );
}
