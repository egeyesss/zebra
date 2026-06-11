/**
 * In-progress puzzle session persistence.
 *
 * A single session object is stored in localStorage, keyed by puzzleId + date
 * so a stale session from yesterday (or a different puzzle) is automatically
 * discarded on load. The session is written on every meaningful state change
 * and periodically via the timer tick, so a refresh or tab close loses at most
 * ~10 seconds of elapsed time but nothing in terms of grid progress.
 */

export const SESSION_KEY = "zebra.session.v1";

export interface PuzzleSession {
  v: 1;
  puzzleId: string;
  /** Reset-timezone YYYY-MM-DD — used to discard yesterday's session. */
  date: string;
  elapsedSeconds: number;
  started: boolean;
  committed: Record<string, string>;
  overwrites: number;
  overwrittenCells: string[];
  /** Record<cellKey, eliminatedValues[]> */
  notes: Record<string, string[]>;
  checkUsed: boolean;
  checkedCell: { key: string; value: string; correct: boolean } | null;
  solved: boolean;
  finalTime: number | null;
}

export function saveSession(s: PuzzleSession): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  } catch {
    // Storage quota exceeded — silently ignore.
  }
}

/**
 * Load and validate a session. Returns null if there is no session, it is
 * stale (wrong puzzle or wrong date), or it is structurally invalid.
 */
export function loadSession(
  puzzleId: string,
  date: string,
): PuzzleSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const s = JSON.parse(raw) as Partial<PuzzleSession>;
    if (
      s.v !== 1 ||
      s.puzzleId !== puzzleId ||
      s.date !== date ||
      typeof s.elapsedSeconds !== "number" ||
      typeof s.committed !== "object"
    ) {
      return null;
    }
    return s as PuzzleSession;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
}
