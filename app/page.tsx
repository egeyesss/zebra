/**
 * Landing page — server component.
 *
 * All interactions use native browser behaviour (links / CSS :target) so they
 * work on every device regardless of whether React's client-side JavaScript has
 * finished loading or is running at all.
 *
 * Mode selection  →  plain <a href="/?mode=..."> (full-page GET, server renders active state)
 * How to play     →  <a href="#howto"> + CSS :target overlay (zero JavaScript)
 * Play            →  plain <a href="/play?mode=...">
 * Countdown       →  CountdownSection client component (graceful: invisible if JS fails)
 */

import { Suspense } from "react";

import { CountdownSection } from "@/components/CountdownSection";
import { EscapeClose } from "@/components/EscapeClose";
import { ModeSelector } from "@/components/ModeSelector";
import { StreakBlock } from "@/components/StreakBlock";
import { isFridayInToronto } from "@/lib/data/selection";

// ---------------------------------------------------------------------------
// Decorative mid-solve hero grid (server-rendered, aria-hidden)
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
    <div aria-hidden="true" className="lp-hero-grid">
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
            <span className="lp-cell-text">{cell.committed}</span>
          )}
          {cell.dot && (
            <span
              className="absolute top-1.5 right-1.5 rounded-full"
              style={{ width: 7, height: 7, background: "var(--accent-red)" }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// How-to-play rules
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
        <span className="text-fg-muted">10:00 Coffee · 25:00 Deep.</span>{" "}
        Hit the cap and it&apos;s a <b>DNF</b>.
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

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

type Mode = "coffee" | "deep";

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const mode: Mode = params.mode === "coffee" ? "coffee" : "deep";
  const isFriday = isFridayInToronto();

  return (
    <>
      <main
        className="flex h-dvh flex-col items-center justify-center overflow-hidden"
        style={{
          padding: "clamp(12px, 2.5dvh, 32px) 24px",
          gap: "clamp(4px, 1.5dvh, 12px)",
        }}
      >
        {/* On desktop, hero grid and streak counter sit side-by-side.
            On mobile the streak lives at the bottom of the page (below the
            countdown) so it doesn't crowd the hero grid. */}
        <div className="flex items-center gap-8 xl:gap-14">
          <HeroGrid />
          <div className="hidden lg:block">
            <StreakBlock />
          </div>
        </div>

        <h1 className="lp-wordmark">z e b r a</h1>

        <p
          className="text-center text-fg-muted"
          style={{ fontSize: "clamp(13px, 2dvh, 19px)", lineHeight: 1.5, maxWidth: "48ch" }}
        >
          Solve the daily logic grid.
          <br />
          <b className="text-fg font-medium">
            No hints, no undo. Every commit is final.
          </b>
        </p>

        {/* Mode selector + action buttons — client component so switching tabs
            uses history.replaceState() instead of a full page reload. The
            server-rendered initialMode sets the correct active state on first
            paint; after that, mode state lives in the component. */}
        <ModeSelector initialMode={mode} isFriday={isFriday} />

        {/* Countdown section — client component. Shows date + live countdown.
            Falls back to an empty space if JS doesn't load (page still usable). */}
        <Suspense fallback={<div className="mt-14" style={{ height: "112px" }} />}>
          <CountdownSection initialMode={mode} isFriday={isFriday} />
        </Suspense>

        {/* Mobile streak — sits between the countdown and the footer links.
            Desktop already has the full StreakBlock beside the hero grid. */}
        <div className="lg:hidden">
          <StreakBlock compact />
        </div>

        <div
          className="flex flex-col items-center gap-2"
          style={{ fontSize: "13px" }}
        >
          <a
            href="/about"
            style={{
              color: "var(--fg-muted)",
              textDecoration: "none",
              letterSpacing: "0.15em",
              opacity: 0.6,
            }}
          >
            about
          </a>
          <div
            className="text-center text-fg-muted"
            style={{ letterSpacing: "0.2em", opacity: 0.45 }}
          >
            zebra.xyz
          </div>
        </div>
      </main>

      {/* How-to-play overlay.
          Tailwind's CSS optimizer drops :target rules from globals.css, so we
          inject the one rule that actually toggles visibility via a <style> tag —
          it lives in the HTML and is never processed by the optimizer.
          #howto is hidden via Tailwind's `hidden` class (specificity 0,1,0).
          #howto:target has specificity 1,1,0 — wins, shows the overlay. */}
      <style>{`#howto:target { display: flex !important; }`}</style>

      <div
        id="howto"
        className="hidden fixed inset-0 z-50 items-center justify-center p-6"
        style={{ background: "rgba(10,8,6,0.8)" }}
      >
        {/* Sheet — z-index above the backdrop */}
        <div
          className="relative z-10 w-full rounded-[10px] px-7 py-7"
          style={{
            maxWidth: "440px",
            background: "var(--bg-elev)",
            boxShadow:
              "inset 0 0 0 1px var(--border), 0 30px 80px rgba(0,0,0,0.6)",
          }}
          role="dialog"
          aria-modal="true"
        >
          <EscapeClose activeHash="howto" closeTo="#_" />
          <div className="mb-[18px] flex items-center justify-between">
            <span
              className="text-fg-muted"
              style={{ fontSize: "11px", letterSpacing: "0.25em" }}
            >
              HOW TO PLAY
            </span>
            <a
              href="#_"
              className="text-fg-muted hover:text-fg px-1 text-sm"
              style={{ textDecoration: "none" }}
            >
              esc ✕
            </a>
          </div>
          <ul className="m-0 list-none p-0">
            {RULES.map((rule, i) => (
              <li
                key={i}
                className="flex gap-3 py-[11px] text-[15px] leading-relaxed text-fg"
                style={{
                  borderTop: i > 0 ? "1px solid var(--border)" : undefined,
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
        {/* Backdrop — behind the sheet; clicking navigates to #_ which clears
            :target and hides the overlay */}
        <a
          href="#_"
          className="absolute inset-0 z-0"
          aria-label="Close how to play"
        />
      </div>
    </>
  );
}
