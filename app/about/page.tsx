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

      <footer
        className="border-border flex flex-col gap-3 border-t pt-6"
        style={{ fontSize: "13px" }}
      >
        <p className="text-fg-muted" style={{ letterSpacing: "0.04em" }}>
          Developed by Ege Yesilyurt
        </p>
        <div className="flex flex-col gap-2">
          <a
            href="https://github.com/egeyesss"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 w-fit"
            style={{ color: "var(--fg-muted)", textDecoration: "none" }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{ width: 18, height: 18, flexShrink: 0 }}
              aria-hidden="true"
            >
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            <span style={{ color: "var(--accent-amber)" }}>github.com/egeyesss</span>
          </a>
          <a
            href="https://www.linkedin.com/in/egeyesss/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 w-fit"
            style={{ color: "var(--fg-muted)", textDecoration: "none" }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{ width: 18, height: 18, flexShrink: 0 }}
              aria-hidden="true"
            >
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            <span style={{ color: "var(--accent-amber)" }}>linkedin.com/in/egeyesss</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
