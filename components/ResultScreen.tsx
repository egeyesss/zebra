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
  /** Whether the player used their one-time cell check. Stored here for future result screen display. */
  checkUsed: boolean;
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
  const [countdownParts, setCountdownParts] = useState<[string, string]>(["", ""]);
  const [dateStr, setDateStr] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    function update() {
      const s = secsToMidnight();
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      const sec = s % 60;
      setCountdownParts([`${pad(h)}h`, `${pad(m)}m ${pad(sec)}s`]);
      setDateStr(
        new Intl.DateTimeFormat("en-US", {
          timeZone: RESET_TIMEZONE,
          month: "long",
          day: "numeric",
        }).format(new Date()),
      );
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const isWin = mode === "win";
  const timeStr = formatTime(elapsedSeconds);
  const shareText = buildShareText(mode, track, number, timeStr, overwrites, cellsFilled);
  const { emoji, label } = TRACKS[track];

  const stateColor = isWin ? "var(--accent-green)" : "var(--accent-red)";
  const stateLabel = isWin ? "SOLVED" : "DID NOT FINISH";
  const heroText = isWin ? timeStr : "DNF";
  const heroColor = isWin ? "var(--fg)" : "var(--accent-red)";
  const subtitle = isWin
    ? overwrites === 0
      ? "flawless"
      : `${overwrites} overwrite${overwrites !== 1 ? "s" : ""}`
    : `${cellsFilled} commit${cellsFilled !== 1 ? "s" : ""}`;

  const paddedNumber = number !== null ? String(number).padStart(3, "0") : null;
  const trackIdStr = `${emoji} ${label.toUpperCase()}${paddedNumber ? ` · #${paddedNumber}` : ""}`;

  function handleCopy() {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const pillBase: React.CSSProperties = {
    fontFamily: "inherit",
    fontSize: "12px",
    padding: "8px 18px",
    borderRadius: "999px",
    cursor: "pointer",
    letterSpacing: "0.06em",
    whiteSpace: "nowrap",
    border: "none",
  };

  return (
    <div
      className="result-fadein fixed inset-0 z-40 flex items-center justify-center px-5"
      style={{ background: "rgba(10,8,6,0.75)" }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "380px",
          background: "var(--bg-elev)",
          boxShadow: "inset 0 0 0 1px var(--border), 0 28px 64px rgba(0,0,0,0.65)",
          borderRadius: "8px",
          padding: "32px 32px 28px",
        }}
      >
        {/* Header: track ID left, date right */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <span
            style={{
              fontSize: "10px",
              letterSpacing: "0.25em",
              color: "var(--fg-muted)",
            }}
          >
            {trackIdStr}
          </span>
          {dateStr && (
            <span
              style={{
                fontSize: "10px",
                color: "var(--fg-muted)",
                opacity: 0.6,
              }}
            >
              {dateStr}
            </span>
          )}
        </div>

        {/* Split row: result left | countdown right */}
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          {/* Left: result */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: "10px",
                letterSpacing: "0.25em",
                color: stateColor,
                marginBottom: "8px",
              }}
            >
              {stateLabel}
            </div>
            <div
              className="tabular-nums font-bold"
              style={{
                fontSize: "clamp(26px, 7vw, 40px)",
                color: heroColor,
                lineHeight: 1,
              }}
            >
              {heroText}
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "var(--fg-muted)",
                marginTop: "8px",
              }}
            >
              {subtitle}
            </div>
          </div>

          {/* Vertical divider */}
          <div
            style={{
              width: "1px",
              background: "var(--border)",
              alignSelf: "stretch",
              margin: "0 20px",
              flexShrink: 0,
            }}
          />

          {/* Right: next puzzle countdown */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: "10px",
                letterSpacing: "0.25em",
                color: "var(--fg-muted)",
                marginBottom: "8px",
              }}
            >
              NEXT PUZZLE
            </div>
            {countdownParts[0] && (
              <div
                className="tabular-nums"
                style={{
                  fontSize: "clamp(18px, 4.5vw, 26px)",
                  fontWeight: 500,
                  color: "var(--accent-amber)",
                  lineHeight: 1.2,
                }}
              >
                {countdownParts[0]}
                <br />
                {countdownParts[1]}
              </div>
            )}
          </div>
        </div>

        {/* Horizontal divider */}
        <div
          style={{
            height: "1px",
            background: "var(--border)",
            margin: "22px 0 18px",
          }}
        />

        {/* Share buttons */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={handleCopy}
            style={{
              ...pillBase,
              background: isWin ? "rgba(109,191,109,0.1)" : "transparent",
              boxShadow: `inset 0 0 0 1px ${isWin ? "var(--accent-green)" : "var(--border)"}`,
              color: isWin
                ? copied
                  ? "var(--fg)"
                  : "var(--accent-green)"
                : "var(--fg)",
            }}
          >
            {copied ? "[ copied ✓ ]" : "[ copy result ]"}
          </button>
          <button
            disabled
            title="Share PNG — coming soon"
            style={{
              ...pillBase,
              background: "transparent",
              boxShadow: "inset 0 0 0 1px var(--border)",
              color: "var(--fg-muted)",
              opacity: 0.4,
              cursor: "not-allowed",
            }}
          >
            [ PNG ↗ ]
          </button>
        </div>

        {/* View solution */}
        <button
          onClick={onViewSolution}
          style={{
            background: "none",
            border: "none",
            color: "var(--fg-muted)",
            fontSize: "11px",
            cursor: "pointer",
            textDecoration: "underline",
            textUnderlineOffset: "3px",
            opacity: 0.5,
            padding: 0,
            marginTop: "16px",
            fontFamily: "inherit",
            display: "block",
          }}
        >
          view solution →
        </button>
      </div>
    </div>
  );
}
