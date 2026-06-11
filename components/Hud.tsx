"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

interface Props {
  started: boolean;
  solved: boolean;
  hardCapSeconds: number;
  overwrites: number;
  /** Seed the timer from a restored session (default 0). */
  initialElapsed?: number;
  /** Called every second with the current elapsed value. */
  onTick?: (elapsed: number) => void;
  /** Called once when the timer freezes (solve), with the final elapsed seconds. */
  onFinish?: (elapsedSeconds: number) => void;
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function Hud({
  started,
  solved,
  hardCapSeconds,
  overwrites,
  initialElapsed = 0,
  onTick,
  onFinish,
}: Props) {
  const [elapsed, setElapsed] = useState(initialElapsed);
  const onTickRef = useRef(onTick);
  useEffect(() => { onTickRef.current = onTick; });
  const finishFiredRef = useRef(false);
  const elapsedRef = useRef(initialElapsed);
  useLayoutEffect(() => {
    elapsedRef.current = elapsed;
  }, [elapsed]);

  // Tick freely while running — no cap, no forced stop at hardCapSeconds.
  useEffect(() => {
    if (!started || solved) return;
    const id = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        onTickRef.current?.(next);
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [started, solved]);

  // Fire onFinish exactly once when the puzzle is solved.
  useEffect(() => {
    if (!solved || finishFiredRef.current) return;
    finishFiredRef.current = true;
    onFinish?.(elapsedRef.current);
  }, [solved, onFinish]);

  const overtime = elapsed >= hardCapSeconds;
  const pct = hardCapSeconds > 0 ? Math.min(elapsed / hardCapSeconds, 1) : 0;

  let timerColor: string;
  if (overtime) {
    timerColor = "var(--accent-red)";
  } else if (pct >= 0.95) {
    timerColor = "var(--accent-red)";
  } else if (pct >= 0.8) {
    timerColor = "var(--accent-amber)";
  } else {
    timerColor = "var(--fg)";
  }

  return (
    <div className="flex items-baseline justify-center gap-3">
      <span
        className="text-5xl font-bold tabular-nums sm:text-6xl"
        style={{ color: timerColor }}
      >
        {formatTime(elapsed)}
      </span>
      <span className="text-fg-muted text-2xl">/ {overwrites}</span>
    </div>
  );
}
