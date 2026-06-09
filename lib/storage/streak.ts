"use client";

import { useSyncExternalStore } from "react";

import type { PuzzleResult, StreakState } from "@/types/streak";

export type { PuzzleResult, StreakState };
export const STREAK_STORAGE_KEY = "zebra.streak.v1";
export const PENDING_RESULT_KEY = "zebra.pending_result.v1";

const ZERO_STATE: StreakState = {
  current: 0,
  longest: 0,
  lastPlayedDate: null,
};

// Module-level cache so getSnapshot() returns a stable reference while the
// underlying localStorage string is unchanged — useSyncExternalStore requires it.
let cachedRaw: string | null = null;
let cachedState: StreakState = ZERO_STATE;

function getSnapshot(): StreakState {
  if (typeof window === "undefined") return ZERO_STATE;
  const raw = window.localStorage.getItem(STREAK_STORAGE_KEY);
  if (raw === cachedRaw) return cachedState;
  cachedRaw = raw;
  try {
    cachedState = raw ? (JSON.parse(raw) as StreakState) : ZERO_STATE;
  } catch {
    cachedState = ZERO_STATE;
  }
  return cachedState;
}

function getServerSnapshot(): StreakState {
  return ZERO_STATE;
}

function subscribe(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

/** Returns the YYYY-MM-DD string for the day before dateStr. */
function dayBefore(dateStr: string): string {
  // Parse as UTC noon to dodge DST edge cases when subtracting a day.
  const d = new Date(dateStr + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Records a puzzle result and updates the persisted streak.
 *
 * Rules (from the brief):
 *   - Solve on a consecutive day → streak increments.
 *   - Solve after a gap → streak resets to 1 (start fresh).
 *   - DNF → streak resets to 0 regardless.
 *   - Calling twice for the same date is a no-op (handles page refresh).
 */
export function recordResult(result: PuzzleResult): void {
  if (typeof window === "undefined") return;

  const raw = window.localStorage.getItem(STREAK_STORAGE_KEY);
  let state: StreakState;
  try {
    state = raw ? (JSON.parse(raw) as StreakState) : ZERO_STATE;
  } catch {
    state = ZERO_STATE;
  }

  const { date, solved } = result;

  // Idempotent — already recorded a result for today.
  if (state.lastPlayedDate === date) return;

  const isConsecutive = state.lastPlayedDate === dayBefore(date);

  let next: StreakState;
  if (solved) {
    const newCurrent = isConsecutive ? state.current + 1 : 1;
    next = {
      current: newCurrent,
      longest: Math.max(state.longest, newCurrent),
      lastPlayedDate: date,
    };
  } else {
    // DNF breaks the streak but still marks today as played so a second
    // attempt (page reload) can't reset and try again.
    next = {
      current: 0,
      longest: state.longest,
      lastPlayedDate: date,
    };
  }

  const serialized = JSON.stringify(next);
  window.localStorage.setItem(STREAK_STORAGE_KEY, serialized);

  // Update the module cache immediately so the next getSnapshot() call
  // returns the new state before React schedules a re-render.
  cachedRaw = serialized;
  cachedState = next;

  // The native 'storage' event only fires in *other* tabs. Dispatch a
  // synthetic one so useSyncExternalStore subscribers in this tab are notified.
  window.dispatchEvent(new StorageEvent("storage", { key: STREAK_STORAGE_KEY }));
}

/** Returns the persisted streak state. Use recordResult() to update it. */
export function useStreak(): StreakState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
