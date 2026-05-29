import type { ExportedClue } from "@/types/puzzle";

/**
 * The clue list — the tall, narrow panel on the right (desktop) or a bottom
 * drawer (mobile). Static: renders the pre-rendered English of each clue,
 * numbered in mono. Scrolls when it overflows.
 */
export function CluePanel({ clues }: { clues: ExportedClue[] }) {
  return (
    <ol className="flex flex-col gap-3 overflow-y-auto leading-relaxed">
      {clues.map((clue, i) => (
        <li key={i} className="flex gap-2">
          <span className="text-fg-muted tabular-nums">{i + 1}.</span>
          <span>{clue.text}</span>
        </li>
      ))}
    </ol>
  );
}
