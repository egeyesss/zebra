"use client";

/**
 * Streak persistence — STUB.
 *
 * v1 has no accounts; the streak lives in localStorage only. This file pins the
 * shape and the storage key so the rest of the app can import against a stable
 * surface, but the real rules are not implemented yet:
 *
 *   TODO(streak): implement recordResult — a streak increments on a solved day,
 *   breaks on a DNF or a skipped Toronto day (see the brief), and tracks the
 *   longest run. Reset boundary is America/Toronto midnight (lib/config.ts).
 *
 * Reading is done through `useSyncExternalStore` so the value is correct on the
 * server (zero state) and stays in sync across tabs via the `storage` event,
 * without a hydrate-in-effect. Until the rules land, `recordResult` is a no-op.
 */

import { useSyncExternalStore } from "react";

export const STREAK_STORAGE_KEY = "zebra.streak.v1";

export interface StreakState {
  current: number;
  longest: number;
  /** YYYY-MM-DD (reset timezone) of the last counted day, or null if never. */
  lastPlayedDate: string | null;
}

export interface PuzzleResult {
  /** Whether the puzzle was solved (vs. DNF). */
  solved: boolean;
  /** Reset-timezone date the result is counted against. */
  date: string;
}

const ZERO_STATE: StreakState = {
  current: 0,
  longest: 0,
  lastPlayedDate: null,
};

// Cache the parsed snapshot so getSnapshot returns a stable reference while the
// underlying string is unchanged — useSyncExternalStore requires that.
let cachedRaw: string | null = null;
let cachedState: StreakState = ZERO_STATE;

function getSnapshot(): StreakState {
  if (typeof window === "undefined") {
    return ZERO_STATE;
  }
  const raw = window.localStorage.getItem(STREAK_STORAGE_KEY);
  if (raw === cachedRaw) {
    return cachedState;
  }
  cachedRaw = raw;
  try {
    cachedState = raw ? (JSON.parse(raw) as StreakState) : ZERO_STATE;
  } catch {
    // Corrupt storage — fall back to the zero state.
    cachedState = ZERO_STATE;
  }
  return cachedState;
}

function getServerSnapshot(): StreakState {
  return ZERO_STATE;
}

function subscribe(onChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

/**
 * Streak hook. Returns the persisted streak and a `recordResult` callback that
 * is currently a no-op (see file header).
 */
export function useStreak(): StreakState & {
  recordResult: (result: PuzzleResult) => void;
} {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function recordResult(_result: PuzzleResult): void {
    // TODO(streak): apply the brief's streak rules and persist. No-op for now.
    void _result;
  }

  return { ...state, recordResult };
}
