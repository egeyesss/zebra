export interface StreakState {
  current: number;
  longest: number;
  /** YYYY-MM-DD (reset timezone) of the last counted day, or null if never played. */
  lastPlayedDate: string | null;
}

export interface PuzzleResult {
  /** Whether the puzzle was solved (vs. DNF). */
  solved: boolean;
  /** Reset-timezone date the result counts against (YYYY-MM-DD). */
  date: string;
}
