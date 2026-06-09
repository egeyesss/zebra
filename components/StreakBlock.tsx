"use client";

import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

import { PENDING_RESULT_KEY, STREAK_STORAGE_KEY, useStreak } from "@/lib/storage/streak";
import { resetZoneDate } from "@/lib/data/selection";
import type { StreakState } from "@/types/streak";

export function StreakBlock({ compact = false }: { compact?: boolean }) {
  const localStreak = useStreak();
  const { status } = useSession();
  const [synced, setSynced] = useState(false);
  const [syncDate, setSyncDate] = useState<string | null>(null);
  // After a successful server sync, override the localStorage snapshot so the
  // correct count shows immediately without depending on the storage event →
  // useSyncExternalStore notification chain (which can race setState batches).
  const [serverStreak, setServerStreak] = useState<StreakState | null>(null);

  // Stable ref so the sync effect always reads the latest local streak without
  // re-running every time the streak count changes.
  const localRef = useRef<StreakState>(localStreak);
  useEffect(() => {
    localRef.current = localStreak;
  }, [localStreak]);

  useEffect(() => {
    if (status !== "authenticated") return;

    const local = localRef.current;

    (async () => {
      // If the user played while signed out, a pending result was stored in
      // localStorage. Flush it to the server now before reading the streak.
      const pendingRaw = localStorage.getItem(PENDING_RESULT_KEY);
      if (pendingRaw) {
        try {
          const pr = JSON.parse(pendingRaw) as { solved: boolean; date: string };
          const r = await fetch("/api/streak", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "result", ...pr }),
          });
          // Remove on success or definitive failure (wrong date = stale).
          // Keep only on 503 (DB down) so we retry next sign-in.
          if (r.status !== 503) {
            localStorage.removeItem(PENDING_RESULT_KEY);
          }
        } catch {
          // Network error — keep the pending result for next sign-in.
        }
      }

      // Fetch and reconcile the server streak.
      const r = await fetch("/api/streak");
      if (!r.ok) return;
      const server: StreakState = await r.json();
      if (typeof server.current !== "number") return;

      if (server.current === 0 && local.current > 0) {
        // New account — promote local streak to server once.
        await fetch("/api/streak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "migrate",
            current: local.current,
            longest: local.longest,
            lastPlayedDate: local.lastPlayedDate,
          }),
        });
      } else if (server.current > 0 || server.lastPlayedDate !== null) {
        // Server has data — it wins. Update both the display and localStorage.
        setServerStreak(server);
        const serialized = JSON.stringify(server);
        localStorage.setItem(STREAK_STORAGE_KEY, serialized);
        window.dispatchEvent(
          new StorageEvent("storage", { key: STREAK_STORAGE_KEY }),
        );
      }
      setSynced(true);
      setSyncDate(resetZoneDate());
    })().catch(() => {
      // Sync failed silently — local streak is the fallback.
    });
  }, [status]);

  const streak = serverStreak ?? localStreak;
  const { current } = streak;
  const hasStreak = current > 0;
  const isSignedIn = status === "authenticated";

  // Format "2026-06-09" → "Jun 9"
  const syncDateFormatted = syncDate
    ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
        new Date(syncDate + "T12:00:00Z"),
      )
    : null;

  // Compact vertical variant for mobile — mini version of the desktop block.
  // Streak number sits above the sync status, everything centered.
  if (compact) {
    return (
      <div className="flex flex-col items-center" style={{ gap: "4px" }}>
        {hasStreak ? (
          <>
            <div className="flex items-center" style={{ gap: "7px" }}>
              <span style={{ fontSize: "22px", lineHeight: 1 }}>🔥</span>
              <span
                className="tabular-nums font-bold text-fg"
                style={{ fontSize: "40px", lineHeight: 1 }}
              >
                {current}
              </span>
            </div>
            <div
              className="text-fg-muted"
              style={{ fontSize: "9px", letterSpacing: "0.25em" }}
            >
              DAY STREAK
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center" style={{ gap: "7px" }}>
            <span style={{ fontSize: "22px", lineHeight: 1 }}>🔥</span>
            <span className="text-fg-muted" style={{ fontSize: "11px" }}>
              Play today to start your streak
            </span>
          </div>
        )}
        <div style={{ marginTop: "4px" }}>
          {isSignedIn && synced ? (
            <span
              style={{
                color: "var(--accent-green)",
                fontSize: "11px",
                letterSpacing: "0.04em",
              }}
            >
              Synced ✓{syncDateFormatted ? ` ${syncDateFormatted}` : ""}
            </span>
          ) : (
            <button
              onClick={() => signIn("google")}
              style={{
                background: "none",
                border: "none",
                color: "var(--accent-amber)",
                fontSize: "12px",
                cursor: "pointer",
                fontFamily: "inherit",
                letterSpacing: "0.04em",
                padding: 0,
              }}
            >
              Sync your streak ↗
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center"
      style={{ gap: "14px", minWidth: "148px" }}
    >
      <span style={{ fontSize: "34px", lineHeight: 1 }}>🔥</span>

      {hasStreak ? (
        <>
          <div
            className="tabular-nums font-bold text-fg"
            style={{ fontSize: "clamp(52px, 6vw, 72px)", lineHeight: 1 }}
          >
            {current}
          </div>
          <div
            className="text-fg-muted"
            style={{ fontSize: "10px", letterSpacing: "0.25em" }}
          >
            DAY STREAK
          </div>
        </>
      ) : (
        <p
          className="text-center text-fg-muted"
          style={{ fontSize: "12px", lineHeight: 1.6, maxWidth: "110px" }}
        >
          Play today to
          <br />
          start your streak
        </p>
      )}

      <div
        style={{ width: "100%", height: "1px", background: "var(--border)" }}
      />

      {isSignedIn && synced ? (
        <span
          style={{
            fontSize: "12px",
            color: "var(--accent-green)",
            letterSpacing: "0.04em",
          }}
        >
          Synced ✓{syncDateFormatted ? ` ${syncDateFormatted}` : ""}
        </span>
      ) : (
        <button
          onClick={() => signIn("google")}
          style={{
            background: "none",
            border: "none",
            color: "var(--accent-amber)",
            fontSize: "13px",
            cursor: "pointer",
            fontFamily: "inherit",
            letterSpacing: "0.04em",
            padding: 0,
          }}
        >
          Sync your streak ↗
        </button>
      )}
    </div>
  );
}
