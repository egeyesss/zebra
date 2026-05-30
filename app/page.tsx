"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { RESET_TIMEZONE } from "@/lib/config";
import { puzzleNumber } from "@/lib/data/selection";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function secsToMidnight(): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: RESET_TIMEZONE,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date());
  const get = (t: string) =>
    parseInt(parts.find((p) => p.type === t)!.value, 10);
  let h = get("hour");
  if (h === 24) h = 0;
  return 86400 - (h * 3600 + get("minute") * 60 + get("second"));
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// ---------------------------------------------------------------------------
// Decorative mid-solve hero grid
// ---------------------------------------------------------------------------

type HeroCell = {
  committed?: string;
  selected?: boolean;
  green?: boolean;
  dot?: boolean;
};

const HERO_CELLS: HeroCell[] = [
  { committed: "Englishman" },
  {},
  {},
  { committed: "Japanese", dot: true },
  {},
  { selected: true },
  {},
  { committed: "zebra", green: true },
  {},
  { committed: "tea" },
  { committed: "milk" },
  {},
  {},
  {},
  {},
  {},
];

function HeroGrid() {
  return (
    <div
      aria-hidden="true"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 122px)",
        gridTemplateRows: "repeat(4, 72px)",
        marginBottom: "16px",
      }}
    >
      {HERO_CELLS.map((cell, i) => (
        <div
          key={i}
          className="relative"
          style={{
            background: cell.green
              ? "rgba(109,191,109,0.18)"
              : cell.selected
                ? "var(--bg-elev-2)"
                : "var(--bg-elev)",
            boxShadow: cell.selected
              ? "inset 0 0 0 2px var(--accent-amber)"
              : "inset 0 0 0 1px var(--border)",
          }}
        >
          {cell.committed && (
            <span
              className="absolute inset-0 flex items-center justify-center text-sm text-fg"
              style={{ whiteSpace: "nowrap" }}
            >
              {cell.committed}
            </span>
          )}
          {cell.dot && (
            <span
              className="absolute top-1.5 right-1.5 rounded-full"
              style={{
                width: 7,
                height: 7,
                background: "var(--accent-red)",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// How-to-play overlay
// ---------------------------------------------------------------------------

const RULES: { marker: string; color?: string; body: React.ReactNode }[] = [
  {
    marker: "▸",
    body: "Read the clues and deduce the value of every cell in the grid.",
  },
  {
    marker: "▸",
    body: (
      <>
        Tap a cell, tap a value — it <b>commits instantly</b>. No &ldquo;are
        you sure&rdquo;.
      </>
    ),
  },
  {
    marker: "●",
    color: "var(--accent-red)",
    body: (
      <>
        Change a committed cell and it&apos;s logged as an <b>overwrite</b>.
        They all count.
      </>
    ),
  },
  {
    marker: "✓",
    color: "var(--accent-green)",
    body: (
      <>
        You get <b>one check</b>, on one cell. That&apos;s your only signal —
        use it well.
      </>
    ),
  },
  {
    marker: "◷",
    color: "var(--accent-amber)",
    body: (
      <>
        Beat the clock.{" "}
        <span className="text-fg-muted">10:00 Coffee · 25:00 Deep.</span> Hit
        the cap and it&apos;s a <b>DNF</b>.
      </>
    ),
  },
  {
    marker: "✨",
    color: "var(--accent-green)",
    body: (
      <>
        Zero overwrites is <b>Flawless</b>. That&apos;s the whole game.
      </>
    ),
  },
];

function HowToPlayOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(10,8,6,0.8)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full rounded-[10px] px-7 py-7"
        style={{
          maxWidth: "440px",
          background: "var(--bg-elev)",
          boxShadow:
            "inset 0 0 0 1px var(--border), 0 30px 80px rgba(0,0,0,0.6)",
        }}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-[18px] flex items-center justify-between">
          <span
            className="text-fg-muted"
            style={{ fontSize: "11px", letterSpacing: "0.25em" }}
          >
            HOW TO PLAY
          </span>
          <button
            onClick={onClose}
            className="text-fg-muted hover:text-fg px-1 text-sm"
          >
            esc ✕
          </button>
        </div>
        <ul className="m-0 list-none p-0">
          {RULES.map((rule, i) => (
            <li
              key={i}
              className="flex gap-3 py-[11px] text-[15px] leading-relaxed text-fg"
              style={{
                borderTop:
                  i > 0 ? "1px solid var(--border)" : undefined,
              }}
            >
              <span
                className="w-3.5 shrink-0 text-center"
                style={{ color: rule.color }}
              >
                {rule.marker}
              </span>
              <span>{rule.body}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Landing page
// ---------------------------------------------------------------------------

type Mode = "coffee" | "deep";

export default function LandingPage() {
  const [mode, setMode] = useState<Mode>("deep");
  const [showHowTo, setShowHowTo] = useState(false);
  const [countdown, setCountdown] = useState("");
  const [date, setDate] = useState("");

  // Client-only: deferred via rAF to avoid hydration mismatch and satisfy
  // react-hooks/set-state-in-effect (no synchronous setState in effect body).
  useEffect(() => {
    function update() {
      setDate(
        new Intl.DateTimeFormat("en-US", {
          timeZone: RESET_TIMEZONE,
          month: "long",
          day: "numeric",
          year: "numeric",
        }).format(new Date()),
      );
      const s = secsToMidnight();
      setCountdown(
        `${pad(Math.floor(s / 3600))}h ${pad(Math.floor((s % 3600) / 60))}m ${pad(s % 60)}s`,
      );
    }
    const raf = requestAnimationFrame(update);
    const id = setInterval(update, 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (!showHowTo) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowHowTo(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [showHowTo]);

  const number = puzzleNumber();
  const modeLabel = mode === "coffee" ? "☕ Coffee · 4 × 4" : "🌊 Deep · 5 × 5";

  return (
    <>
      <main
        className="flex min-h-full flex-col items-center justify-center"
        style={{ padding: "32px 24px 28px" }}
      >
        <HeroGrid />

        {/* Wordmark */}
        <h1
          className="text-fg"
          style={{
            fontSize: "68px",
            fontWeight: 700,
            letterSpacing: "0.4em",
            textTransform: "lowercase",
            marginRight: "-0.4em",
            lineHeight: 1.1,
            whiteSpace: "nowrap",
          }}
        >
          z e b r a
        </h1>

        {/* Tagline */}
        <p
          className="mt-6 text-center text-fg-muted"
          style={{ fontSize: "19px", lineHeight: 1.65, maxWidth: "48ch" }}
        >
          Solve the daily logic grid.
          <br />
          <b className="text-fg font-medium">
            No hints, no undo — every commit is final.
          </b>
        </p>

        {/* Mode selector */}
        <div
          className="mt-9 flex overflow-hidden rounded-full"
          style={{ boxShadow: "inset 0 0 0 1px var(--border)" }}
        >
          {(["coffee", "deep"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                fontFamily: "inherit",
                fontSize: "15px",
                padding: "13px 28px",
                background: mode === m ? "var(--bg-elev-2)" : "transparent",
                color: mode === m ? "var(--fg)" : "var(--fg-muted)",
                cursor: mode === m ? "default" : "pointer",
                border: "none",
                outline: "none",
                whiteSpace: "nowrap",
                transition: "background .15s, color .15s",
              }}
            >
              {m === "coffee" ? "☕ Coffee · 4 × 4" : "🌊 Deep · 5 × 5"}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div
          className="mt-6 flex flex-wrap justify-center"
          style={{ gap: "14px" }}
        >
          <button
            onClick={() => setShowHowTo(true)}
            className="btn-ghost rounded-full text-fg transition-colors"
            style={{
              fontFamily: "inherit",
              fontSize: "16px",
              letterSpacing: "0.02em",
              padding: "16px 40px",
              background: "transparent",
              border: "none",
              boxShadow: "inset 0 0 0 1px var(--border)",
              cursor: "pointer",
            }}
          >
            how to play
          </button>
          <Link
            href={`/play?mode=${mode}`}
            className="btn-play rounded-full no-underline transition-colors"
            style={{
              fontFamily: "inherit",
              fontSize: "16px",
              letterSpacing: "0.02em",
              padding: "16px 40px",
              color: "var(--accent-green)",
              boxShadow: "inset 0 0 0 1.5px var(--accent-green)",
              background: "rgba(109,191,109,0.08)",
            }}
          >
            play
          </Link>
        </div>

        {/* Meta block */}
        <div className="mt-14 text-center" style={{ lineHeight: 2 }}>
          {date && (
            <div
              className="text-fg font-bold"
              style={{ fontSize: "16px", letterSpacing: "0.04em" }}
            >
              {date}
            </div>
          )}
          {number !== null && (
            <div className="text-fg-muted" style={{ fontSize: "15px" }}>
              No. {String(number).padStart(3, "0")}
            </div>
          )}
          <div className="text-fg-muted" style={{ fontSize: "15px" }}>
            {modeLabel}
          </div>
          {countdown && (
            <div
              className="text-fg-muted mt-2.5"
              style={{ fontSize: "14px", opacity: 0.7, whiteSpace: "nowrap" }}
            >
              new puzzle in{" "}
              <b className="text-accent-amber font-normal">{countdown}</b>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="mt-16 text-center text-fg-muted"
          style={{ fontSize: "13px", letterSpacing: "0.2em", opacity: 0.45 }}
        >
          zebra.xyz
        </div>
      </main>

      {showHowTo && <HowToPlayOverlay onClose={() => setShowHowTo(false)} />}
    </>
  );
}
