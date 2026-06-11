import type { Metadata } from "next";
import Link from "next/link";

import { EscapeClose } from "@/components/EscapeClose";
import { Wordmark } from "@/components/Wordmark";

export const metadata: Metadata = {
  title: "About — Zebra",
  description: "What Zebra is and how the daily puzzle works.",
};

/** Static about page. Plain copy, engineer-noir tone. */
export default function AboutPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <EscapeClose closeTo="/" />
      <header className="border-border flex items-center justify-between border-b pb-4">
        <Link href="/">
          <Wordmark />
        </Link>
        <Link href="/" className="text-fg-muted hover:text-fg text-sm">
          esc ×
        </Link>
      </header>

      <article className="flex flex-col gap-4 leading-relaxed">
        <h1 className="text-xl">About</h1>
        <p>
          Zebra is a daily logic-grid puzzle inspired by the Einstein riddle, but
          tuned down for an easier puzzle solving experience. Read the clues,
          deduce which person sits where, and commit each cell against the clock.
        </p>
        <p>
          Two modes: <span className="text-fg-muted">☕ Coffee</span> is a 4×4
          daily challenge. <span className="text-fg-muted">🌊 Deep</span> is a
          5×5 bonus grid, available every Friday for people that really love hard
          puzzles. Every commit is final and counts; your score is the number of
          times you changed your mind. Zero overwrites is{" "}
          <span className="text-accent-green">Flawless</span> and big score = bad.
        </p>
        <p>
          One puzzle a day, the same for everyone, resetting at midnight Toronto
          time. No accounts (unless you want to sync streak across devices), no
          hints beyond a single check, no live correctness feedback until the
          whole grid is solved correctly. Just you and the grid.
        </p>
      </article>
    </div>
  );
}
