"use client";

import { Fragment, useEffect, useRef } from "react";

import type { ExportedPuzzle } from "@/types/puzzle";

interface Props {
  puzzle: ExportedPuzzle;
  committed: Record<string, string>;
  selected: { category: string; position: number } | null;
  overwrittenCells: Set<string>;
  justCommitted: string | null;
  onCellSelect: (category: string, position: number) => void;

  notes: Record<string, Set<string>>;
}

export function PuzzleGrid({
  puzzle,
  committed,
  selected,
  overwrittenCells,
  justCommitted,
  onCellSelect,
  notes,
}: Props) {
  const categories = Object.keys(puzzle.theme.attributes);
  const positions = Array.from({ length: puzzle.size }, (_, i) => i + 1);
  const templateColumns = `minmax(5rem, auto) repeat(${puzzle.size}, minmax(3rem, 1fr))`;

  const gridRef = useRef<HTMLDivElement>(null);
  // Keep a stable ref to the latest callback so the native handler never goes stale.
  const onCellSelectRef = useRef(onCellSelect);
  useEffect(() => {
    onCellSelectRef.current = onCellSelect;
  });

  // Native click delegation — React's synthetic onClick doesn't fire on iOS
  // Safari in Turbopack dev mode. addEventListener bypasses React's event system.
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const handler = (e: Event) => {
      const cell = (e.target as Element).closest(
        "[data-cat]",
      ) as HTMLElement | null;
      if (!cell) return;
      e.preventDefault();
      const cat = cell.dataset.cat!;
      const pos = parseInt(cell.dataset.pos!);
      onCellSelectRef.current(cat, pos);
    };
    el.addEventListener("click", handler);
    return () => el.removeEventListener("click", handler);
  }, []);

  return (
    <div
      ref={gridRef}
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

      {/* One row per attribute category — Fragment avoids display:contents WebKit bugs */}
      {categories.map((category) => (
        <Fragment key={category}>
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
            const cellNotes = notes[key] ?? null;
            const eliminatedList =
              cellNotes && cellNotes.size > 0
                ? Array.from(cellNotes)
                : null;

            return (
              // href="#" makes the element natively clickable on iOS Safari;
              // e.preventDefault() in the container's native handler stops hash nav.
              <a
                key={key}
                href="#"
                role="button"
                aria-pressed={isSelected}
                data-cat={category}
                data-pos={String(pos)}
                className={[
                  "aspect-square min-h-12 flex items-center justify-center relative",
                  isFlashing ? "cell-flash" : "bg-bg-elev-2",
                ].join(" ")}
                style={
                  isSelected && !isFlashing
                    ? { boxShadow: "inset 0 0 0 1.5px var(--accent-amber)" }
                    : undefined
                }
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
                {eliminatedList && (
                  <div
                    className="absolute bottom-0 left-0 right-0 flex flex-wrap px-0.5 pb-0.5"
                    style={{ gap: "1px" }}
                  >
                    {eliminatedList.map((noteVal) => (
                      <span
                        key={noteVal}
                        className="text-[7px] lg:text-[10px]"
                        style={{
                          lineHeight: 1.2,
                          color: "var(--accent-red)",
                          textDecoration: "line-through",
                          textDecorationColor: "var(--accent-red)",
                          overflow: "hidden",
                          maxWidth: "100%",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {noteVal}
                      </span>
                    ))}
                  </div>
                )}
              </a>
            );
          })}
        </Fragment>
      ))}
    </div>
  );
}
