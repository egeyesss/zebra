/**
 * Daily puzzle selection — Wordle-style.
 *
 * The day's puzzle is a deterministic function of the date, not a random draw:
 * everyone gets the same puzzle on the same Toronto day, which is what makes the
 * shared "Zebra #042" number meaningful. The pool is consumed sequentially —
 * day N takes index N — so puzzles don't repeat as long as the bank stays ahead
 * of the cursor.
 *
 * When the cursor runs past the end of the pool we wrap around and replay the
 * bank from the start. Repeats aren't ideal, but they beat the site going dark
 * when nobody is around to top up the bank; dropping a bigger bundle into
 * data/puzzles/ later pushes the wrap point out with no code change.
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
 * Returns true if the given instant falls on a Friday in the reset timezone.
 * Deep (5×5) is a Friday-only bonus challenge; Coffee (4×4) runs daily.
 */
export function isFridayInToronto(at: Date = new Date()): boolean {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: RESET_TIMEZONE,
    weekday: "long",
  }).format(at) === "Friday";
}

/**
 * The puzzle scheduled for the given instant, or null before launch or when the
 * pool is empty. Once the bank is exhausted the pool wraps and replays from the
 * start, so a non-empty pool always yields a puzzle after launch.
 */
export function selectDailyPuzzle(
  pool: ExportedPuzzle[],
  at: Date = new Date(),
): ExportedPuzzle | null {
  const index = dayIndex(at);
  if (index < 0 || pool.length === 0) {
    return null;
  }
  return pool[index % pool.length];
}

/** Day of week (0=Sun…6=Sat) for LAUNCH_DATE in the reset timezone. */
function launchDayOfWeek(): number {
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dow = new Intl.DateTimeFormat("en-US", {
    timeZone: RESET_TIMEZONE,
    weekday: "short",
  // Use noon UTC to dodge any DST edge on the launch date.
  }).format(new Date(`${LAUNCH_DATE}T12:00:00Z`));
  return weekdays.indexOf(dow);
}

/**
 * Zero-based index into the Deep (5×5) pool for the current Friday.
 * Returns -1 if the instant is not a Friday in the reset timezone, falls
 * before launch, or is before the first Friday on or after launch.
 *
 * Example: if launch is a Monday, the first Friday is day 4 → Deep #0.
 * The following Friday is day 11 → Deep #1, and so on.
 */
export function deepPuzzleIndex(at: Date = new Date()): number {
  if (!isFridayInToronto(at)) return -1;
  const dIdx = dayIndex(at);
  if (dIdx < 0) return -1;
  const launchDow = launchDayOfWeek();
  const firstFridayOffset = (5 - launchDow + 7) % 7;
  if (dIdx < firstFridayOffset) return -1;
  return Math.floor((dIdx - firstFridayOffset) / 7);
}

/**
 * Human-facing Deep puzzle number ("Deep #N"), one-based.
 * Returns null when today is not a Friday or no Friday has arrived yet.
 */
export function deepPuzzleNumber(at: Date = new Date()): number | null {
  const index = deepPuzzleIndex(at);
  return index < 0 ? null : index + 1;
}

/**
 * The Deep puzzle scheduled for the given Friday, or null when it's not a
 * Friday, before launch, or the pool is empty. Like the daily pool, an
 * exhausted Deep bank wraps and replays from the start.
 */
export function selectDeepPuzzle(
  pool: ExportedPuzzle[],
  at: Date = new Date(),
): ExportedPuzzle | null {
  const index = deepPuzzleIndex(at);
  if (index < 0 || pool.length === 0) return null;
  return pool[index % pool.length];
}
