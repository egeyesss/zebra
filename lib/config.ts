/**
 * App-wide constants. Kept in one place so the data layer, the daily-puzzle
 * selection, and the UI all agree on the same numbers.
 */

import type { Track } from "@/types/puzzle";

/** Schema version this build is written against. */
export const EXPECTED_SCHEMA_VERSION = "1.0.1";

/**
 * Canonical reset timezone. The daily puzzle rolls over at midnight here, the
 * same instant for everyone — that's what keeps "Zebra #042" identical across
 * players. (Per-device local time would fragment the shared puzzle number.)
 */
export const RESET_TIMEZONE = "America/Toronto";

/**
 * Day 1 of the game in the reset timezone (YYYY-MM-DD). The day's puzzle index
 * is the number of whole days between this date and "today" in Toronto, so the
 * launch date maps to puzzle #1. Provisional until the launch is scheduled.
 */
export const LAUNCH_DATE = "2026-06-11";

export interface TrackConfig {
  id: Track;
  label: string;
  emoji: string;
  /** Grid size this track maps to. */
  size: number;
  /** Hard timer cap in seconds; hitting it is a DNF. */
  hardCapSeconds: number;
}

/** The two daily tracks, keyed by grid size. See the product brief. */
export const TRACKS: Record<Track, TrackConfig> = {
  coffee: {
    id: "coffee",
    label: "Coffee",
    emoji: "☕️", // ☕ U+FE0F forces emoji presentation over text/symbol
    size: 4,
    hardCapSeconds: 10 * 60,
  },
  deep: {
    id: "deep",
    label: "Deep",
    emoji: "🌊", // 🌊
    size: 5,
    hardCapSeconds: 25 * 60,
  },
};

/** Map a grid size to its track. Throws on an unsupported size. */
export function trackForSize(size: number): Track {
  const match = Object.values(TRACKS).find((t) => t.size === size);
  if (!match) {
    throw new Error(`no track defined for grid size ${size}`);
  }
  return match.id;
}
