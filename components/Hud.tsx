"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

interface Props {
  started: boolean;
  solved: boolean;
  dnf: boolean;
  hardCapSeconds: number;
  overwrites: number;
  onDnf: () => void;
  /** Called once when the timer freezes (win or DNF), with the final elapsed seconds. */
  onFinish?: (elapsedSeconds: number) => void;
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function Hud({
  started,
  solved,
  dnf,
  hardCapSeconds,
  overwrites,
  onDnf,
  onFinish,
}: Props) {
  const [elapsed, setElapsed] = useState(0);
  const dnfFiredRef = useRef(false);
  const finishFiredRef = useRef(false);
  // Always hold latest callbacks without re-registering the interval.
  const onDnfRef = useRef(onDnf);
  useEffect(() => {
    onDnfRef.current = onDnf;
  });
  // Live ref so the onFinish effect always reads the current elapsed value.
  // useLayoutEffect (not render assignment) satisfies react-hooks/refs; layout
  // effects run before regular effects, so the ref is fresh when stopped fires.
  const elapsedRef = useRef(0);
  useLayoutEffect(() => {
    elapsedRef.current = elapsed;
  }, [elapsed]);

  const stopped = solved || dnf;

  // Tick up while running; clean up when stopped or unmounted.
  useEffect(() => {
    if (!started || stopped) return;
    const id = setInterval(() => {
      setElapsed((prev) => Math.min(prev + 1, hardCapSeconds));
    }, 1000);
    return () => clearInterval(id);
  }, [started, stopped, hardCapSeconds]);

  // Fire onDnf exactly once when the cap is reached.
  useEffect(() => {
    if (!started || stopped) return;
    if (elapsed < hardCapSeconds) return;
    if (dnfFiredRef.current) return;
    dnfFiredRef.current = true;
    onDnfRef.current();
  }, [elapsed, hardCapSeconds, started, stopped]);

  // Fire onFinish exactly once when the timer freezes (win or DNF).
  useEffect(() => {
    if (!stopped || finishFiredRef.current) return;
    finishFiredRef.current = true;
    onFinish?.(elapsedRef.current);
  }, [stopped, onFinish]);

  const pct = hardCapSeconds > 0 ? elapsed / hardCapSeconds : 0;
  let timerColor: string;
  if (dnf) {
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
