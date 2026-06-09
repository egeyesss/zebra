import { neon } from "@neondatabase/serverless";

import type { PuzzleResult, StreakState } from "@/types/streak";

function sql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set — provision a Neon database first");
  return neon(url);
}

const ZERO: StreakState = { current: 0, longest: 0, lastPlayedDate: null };

function dayBefore(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

function rowToState(row: Record<string, unknown> | undefined): StreakState {
  if (!row) return ZERO;
  return {
    current: Number(row.current ?? 0),
    longest: Number(row.longest ?? 0),
    lastPlayedDate: row.last_played ? String(row.last_played) : null,
  };
}

export async function getServerStreak(userId: string): Promise<StreakState> {
  const db = sql();
  const rows = await db`
    SELECT current, longest, last_played
    FROM streaks
    WHERE user_id = ${userId}
  `;
  return rowToState(rows[0]);
}

/**
 * Applies the same consecutive-day streak rules as the client-side
 * recordResult(), but server-side so the client can't push arbitrary numbers.
 * The caller must have already validated that `result.date` is today's date.
 */
export async function recordServerResult(
  userId: string,
  result: PuzzleResult,
): Promise<StreakState> {
  const db = sql();
  const { date, solved } = result;

  const existing = await getServerStreak(userId);

  // Idempotent — already recorded today.
  if (existing.lastPlayedDate === date) return existing;

  const isConsecutive = existing.lastPlayedDate === dayBefore(date);

  let next: StreakState;
  if (solved) {
    const newCurrent = isConsecutive ? existing.current + 1 : 1;
    next = {
      current: newCurrent,
      longest: Math.max(existing.longest, newCurrent),
      lastPlayedDate: date,
    };
  } else {
    next = { current: 0, longest: existing.longest, lastPlayedDate: date };
  }

  await db`
    INSERT INTO streaks (user_id, current, longest, last_played)
    VALUES (${userId}, ${next.current}, ${next.longest}, ${next.lastPlayedDate})
    ON CONFLICT (user_id) DO UPDATE SET
      current    = EXCLUDED.current,
      longest    = EXCLUDED.longest,
      last_played = EXCLUDED.last_played
  `;

  return next;
}

/**
 * One-time migration: promotes a local streak to a fresh server account.
 * Silently no-ops if the server already has a streak (current > 0), so
 * a retried request can't overwrite real server data.
 */
export async function migrateLocalStreak(
  userId: string,
  local: StreakState,
): Promise<StreakState> {
  const db = sql();
  const existing = await getServerStreak(userId);

  // Only migrate to accounts that have never had a server streak.
  if (existing.current > 0) return existing;

  await db`
    INSERT INTO streaks (user_id, current, longest, last_played)
    VALUES (${userId}, ${local.current}, ${local.longest}, ${local.lastPlayedDate})
    ON CONFLICT (user_id) DO UPDATE SET
      current     = EXCLUDED.current,
      longest     = EXCLUDED.longest,
      last_played  = EXCLUDED.last_played
    WHERE streaks.current = 0
  `;

  return local;
}
