"use client";

import { useEffect, useState } from "react";

import { RESET_TIMEZONE, TRACKS } from "@/lib/config";
import type { Track } from "@/types/puzzle";

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function secsToMidnight(): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: RESET_TIMEZONE,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date());
  const get = (t: string) => {
    const part = parts.find((p) => p.type === t);
    return part ? parseInt(part.value, 10) : 0;
  };
  const h = get("hour") % 24;
  return 86400 - (h * 3600 + get("minute") * 60 + get("second"));
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function buildShareText(
  mode: "win" | "dnf",
  track: Track,
  number: number | null,
  timeStr: string,
  overwrites: number,
  cellsFilled: number,
): string {
  const { emoji, label } = TRACKS[track];
  const header = `Zebra${number !== null ? ` #${number}` : ""} ${emoji} ${label}`;
  if (mode === "dnf") {
    return `${header}\nDNF at ${timeStr} · ${cellsFilled} commit${cellsFilled !== 1 ? "s" : ""}\nzebra.xyz`;
  }
  const scoreStr =
    overwrites === 0 ? "Flawless" : `${overwrites} overwrite${overwrites !== 1 ? "s" : ""}`;
  return `${header}\n${timeStr} · ${scoreStr}\nzebra.xyz`;
}

interface Props {
  mode: "win" | "dnf";
  track: Track;
  number: number | null;
  elapsedSeconds: number;
  overwrites: number;
  cellsFilled: number;
  onViewSolution: () => void;
}

export function ResultScreen({
  mode,
  track,
  number,
  elapsedSeconds,
  overwrites,
  cellsFilled,
  onViewSolution,
}: Props) {
  const [countdown, setCountdown] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    function update() {
      const s = secsToMidnight();
      setCountdown(
        `${pad(Math.floor(s / 3600))}h ${pad(Math.floor((s % 3600) / 60))}m ${pad(s % 60)}s`,
      );
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const isFlawless = mode === "win" && overwrites === 0;
  const timeStr = formatTime(elapsedSeconds);
  const shareText = buildShareText(mode, track, number, timeStr, overwrites, cellsFilled);

  function handleCopy() {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div
      className="result-fadein fixed inset-0 z-40 flex flex-col items-center justify-center gap-10 px-6"
      style={{ background: "rgba(26,22,18,0.97)" }}
    >
      {/* Score block */}
      <div className="flex flex-col items-center gap-3">
        {mode === "win" ? (
          <>
            <span
              className="tracking-widest uppercase"
              style={{
                fontSize: "clamp(13px, 3.5vw, 18px)",
                color: isFlawless ? "var(--accent-green)" : "var(--fg-muted)",
                letterSpacing: "0.35em",
              }}
            >
              {isFlawless ? "Flawless" : "Solved"}
            </span>
            <span
              className="tabular-nums font-bold"
              style={{
                fontSize: "clamp(64px, 18vw, 100px)",
                color: isFlawless ? "var(--accent-green)" : "var(--fg)",
                lineHeight: 1,
              }}
            >
              {timeStr}
            </span>
            {overwrites > 0 && (
              <span className="text-fg-muted" style={{ fontSize: "15px" }}>
                {overwrites} overwrite{overwrites !== 1 ? "s" : ""}
              </span>
            )}
          </>
        ) : (
          <>
            <span
              className="font-bold tracking-widest uppercase"
              style={{
                fontSize: "clamp(56px, 16vw, 88px)",
                color: "var(--accent-red)",
                lineHeight: 1,
              }}
            >
              DNF
            </span>
            <span className="text-fg" style={{ fontSize: "clamp(16px, 4vw, 22px)" }}>
              at {timeStr}
            </span>
            <span className="text-fg-muted" style={{ fontSize: "14px" }}>
              {cellsFilled} commit{cellsFilled !== 1 ? "s" : ""} made
            </span>
          </>
        )}
      </div>

      {/* Share buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleCopy}
          style={{
            background: "transparent",
            border: "1.5px solid var(--border)",
            color: copied ? "var(--accent-green)" : "var(--fg)",
            borderColor: copied ? "var(--accent-green)" : "var(--border)",
            borderRadius: "6px",
            padding: "8px 20px",
            fontSize: "13px",
            letterSpacing: "0.08em",
            cursor: "pointer",
            transition: "color 150ms, border-color 150ms",
          }}
        >
          {copied ? "copied ✓" : "copy result"}
        </button>
        <button
          disabled
          title="Share PNG — coming soon"
          style={{
            background: "transparent",
            border: "1.5px solid var(--border)",
            color: "var(--fg-muted)",
            borderRadius: "6px",
            padding: "8px 20px",
            fontSize: "13px",
            letterSpacing: "0.08em",
            opacity: 0.4,
            cursor: "not-allowed",
          }}
        >
          PNG ↗
        </button>
      </div>

      {/* Countdown */}
      {countdown && (
        <p className="text-fg-muted" style={{ fontSize: "13px" }}>
          next puzzle in{" "}
          <span style={{ color: "var(--accent-amber)" }}>{countdown}</span>
        </p>
      )}

      {/* View solution */}
      <button
        onClick={onViewSolution}
        style={{
          background: "none",
          border: "none",
          color: "var(--fg-muted)",
          fontSize: "12px",
          cursor: "pointer",
          textDecoration: "underline",
          textUnderlineOffset: "3px",
          letterSpacing: "0.04em",
          opacity: 0.7,
          padding: 0,
        }}
      >
        view solution →
      </button>
    </div>
  );
}
