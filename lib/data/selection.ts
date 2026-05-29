/**
 * Daily puzzle selection — Wordle-style.
 *
 * The day's puzzle is a deterministic function of the date, not a random draw:
 * everyone gets the same puzzle on the same Toronto day, which is what makes the
 * shared "Zebra #042" number meaningful. The pool is consumed sequentially —
 * day N takes index N — so puzzles never repeat as long as the bank stays ahead
 * of the cursor. A puzzle "behind" today's index is simply spent and never
 * reappears; that's the no-duplicates guarantee, no separate "used" store
 * needed for v1.
 *
 * When the cursor runs past the end of the pool the bank is exhausted and we
 * return null rather than wrapping (wrapping would replay old puzzles). Keeping
 * the bank topped up is an operational task, not a code path.
 */

import { LAUNCH_DATE, RESET_TIMEZONE } from "@/lib/config";
import type { ExportedPuzzle } from "@/types/puzzle";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Render an instant as a YYYY-MM-DD calendar date in the reset timezone. This,
 * not the user's local clock, defines which day it is for puzzle purposes.
 */
export function resetZoneDate(at: Date = new Date()): string {
  // en-CA formats as YYYY-MM-DD, which is exactly what we want.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: RESET_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(at);
}

/** Whole-day count between two YYYY-MM-DD dates, treated as UTC midnights. */
function daysBetween(fromYmd: string, toYmd: string): number {
  const from = Date.parse(`${fromYmd}T00:00:00Z`);
  const to = Date.parse(`${toYmd}T00:00:00Z`);
  return Math.round((to - from) / MS_PER_DAY);
}

/**
 * Zero-based pool index for a given instant: 0 on the launch date, 1 the next
 * Toronto day, and so on. Can be negative before launch.
 */
export function dayIndex(at: Date = new Date()): number {
  return daysBetween(LAUNCH_DATE, resetZoneDate(at));
}

/**
 * Human-facing puzzle number ("Zebra #N"), one-based off the launch date.
 * Returns null before launch, where no puzzle is scheduled yet.
 */
export function puzzleNumber(at: Date = new Date()): number | null {
  const index = dayIndex(at);
  return index < 0 ? null : index + 1;
}

/**
 * The puzzle scheduled for the given instant, or null if none is (before launch,
 * or after the bank is exhausted).
 */
export function selectDailyPuzzle(
  pool: ExportedPuzzle[],
  at: Date = new Date(),
): ExportedPuzzle | null {
  const index = dayIndex(at);
  if (index < 0 || index >= pool.length) {
    return null;
  }
  return pool[index];
}
