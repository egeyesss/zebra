"use client";

import { useStreak } from "@/lib/storage/streak";

export function StreakBlock() {
  const { current } = useStreak();
  const hasStreak = current > 0;

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

      <div style={{ width: "100%", height: "1px", background: "var(--border)" }} />

      {/* Phase 3: replace this button with signed-in state ("Synced ✓ Jun 9") */}
      <button
        onClick={() => {/* Phase 3: trigger Google OAuth */}}
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
    </div>
  );
}
