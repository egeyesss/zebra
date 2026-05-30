"use client";

import { useEffect, useState } from "react";

import { RESET_TIMEZONE } from "@/lib/config";
import { puzzleNumber } from "@/lib/data/selection";

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

export function CountdownSection({
  initialMode,
}: {
  initialMode: "coffee" | "deep";
}) {
  const [mode, setMode] = useState(initialMode);
  const [date, setDate] = useState("");
  const [countdown, setCountdown] = useState("");

  // Sync with ModeSelector's custom event so the label updates without a reload
  useEffect(() => {
    const handler = (e: Event) =>
      setMode((e as CustomEvent<"coffee" | "deep">).detail);
    window.addEventListener("zebra:mode", handler);
    return () => window.removeEventListener("zebra:mode", handler);
  }, []);

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

  const number = puzzleNumber();
  const modeLabel = mode === "coffee" ? "☕ Coffee · 4 × 4" : "🌊 Deep · 5 × 5";

  return (
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
  );
}
