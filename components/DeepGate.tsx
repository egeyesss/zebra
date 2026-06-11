"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { RESET_TIMEZONE } from "@/lib/config";
import { Wordmark } from "./Wordmark";

function secsToNextFriday(): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: RESET_TIMEZONE,
    hour12: false,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date());
  const get = (t: string) =>
    parseInt(parts.find((p) => p.type === t)?.value ?? "0", 10);
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "Mon";
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dow = days.indexOf(weekday);
  const secsInDay = (get("hour") % 24) * 3600 + get("minute") * 60 + get("second");
  const secsRemainingToday = 86400 - secsInDay;
  const daysUntilFriday = (5 - dow + 7) % 7;
  return secsRemainingToday + (daysUntilFriday - 1) * 86400;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatCountdown(secs: number): string {
  const d = Math.floor(secs / 86400);
  const rem = secs % 86400;
  const h = Math.floor(rem / 3600);
  const m = Math.floor((rem % 3600) / 60);
  const s = rem % 60;
  if (d > 0) return `${d}d ${pad(h)}h ${pad(m)}m`;
  return `${pad(h)}h ${pad(m)}m ${pad(s)}s`;
}

export function DeepGate() {
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    function update() {
      setCountdown(formatCountdown(secsToNextFriday()));
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex h-dvh flex-col">
      <header className="border-border flex items-center border-b px-4 py-4">
        <Link href="/" className="no-underline">
          <Wordmark />
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <div
          className="text-fg-muted"
          style={{ fontSize: "clamp(13px, 2dvh, 17px)" }}
        >
          <span style={{ fontSize: "1.3em", marginRight: "0.35em" }}>🌊</span>
          Deep · 5 × 5
        </div>

        <div className="flex flex-col items-center gap-2">
          <p
            className="text-fg"
            style={{ fontSize: "clamp(15px, 2.5dvh, 22px)", fontWeight: 500 }}
          >
            Deep is a Friday puzzle.
          </p>
          <p
            className="text-fg-muted"
            style={{ fontSize: "clamp(12px, 1.8dvh, 15px)" }}
          >
            Come back then — a fresh 5×5 grid will be waiting.
          </p>
        </div>

        {countdown && (
          <div
            className="text-fg-muted"
            style={{ fontSize: "clamp(12px, 1.8dvh, 15px)" }}
          >
            next Deep in{" "}
            <b className="text-accent-amber font-normal">{countdown}</b>
          </div>
        )}

        <Link
          href="/play?mode=coffee"
          className="text-accent-green no-underline"
          style={{
            fontSize: "clamp(12px, 1.8dvh, 15px)",
            letterSpacing: "0.08em",
          }}
        >
          play Coffee instead →
        </Link>
      </main>
    </div>
  );
}
