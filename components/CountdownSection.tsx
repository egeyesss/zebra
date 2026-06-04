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

function secsToNextFriday(): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: RESET_TIMEZONE,
    hour12: false,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date());
  const get = (t: string) => parseInt(parts.find((p) => p.type === t)?.value ?? "0", 10);
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "Mon";
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dow = days.indexOf(weekday);
  const h = get("hour") % 24;
  const secsInDay = h * 3600 + get("minute") * 60 + get("second");
  const secsRemainingToday = 86400 - secsInDay;
  const daysUntilFriday = (5 - dow + 7) % 7;
  return secsRemainingToday + (daysUntilFriday - 1) * 86400;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatFridayCountdown(secs: number): string {
  const d = Math.floor(secs / 86400);
  const rem = secs % 86400;
  const h = Math.floor(rem / 3600);
  const m = Math.floor((rem % 3600) / 60);
  const s = rem % 60;
  if (d > 0) return `${d}d ${pad(h)}h ${pad(m)}m`;
  return `${pad(h)}h ${pad(m)}m ${pad(s)}s`;
}

export function CountdownSection({
  initialMode,
  isFriday,
}: {
  initialMode: "coffee" | "deep";
  isFriday: boolean;
}) {
  const [mode, setMode] = useState(initialMode);
  const [date, setDate] = useState("");
  const [countdown, setCountdown] = useState("");
  const [fridayCountdown, setFridayCountdown] = useState("");

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
      if (!isFriday) {
        setFridayCountdown(formatFridayCountdown(secsToNextFriday()));
      }
    }
    const raf = requestAnimationFrame(update);
    const id = setInterval(update, 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(id);
    };
  }, [isFriday]);

  const number = puzzleNumber();
  const modeLabel =
    mode === "coffee" ? (
      <><span style={{ fontSize: "1.3em", marginRight: "0.35em" }}>☕️</span>Coffee · 4 × 4</>
    ) : (
      <><span style={{ fontSize: "1.3em", marginRight: "0.35em" }}>🌊</span>Deep · 5 × 5</>
    );

  // Deep selected on a non-Friday — show countdown to next Deep
  if (mode === "deep" && !isFriday) {
    return (
      <div className="text-center" style={{ lineHeight: 1.7 }}>
        <div className="text-fg-muted" style={{ fontSize: "clamp(11px, 1.7dvh, 15px)" }}>
          {modeLabel}
        </div>
        <div className="text-fg-muted" style={{ fontSize: "clamp(11px, 1.7dvh, 14px)", opacity: 0.6 }}>
          available every Friday
        </div>
        {fridayCountdown && (
          <div
            className="text-fg-muted mt-1"
            style={{ fontSize: "clamp(10px, 1.6dvh, 14px)", opacity: 0.7, whiteSpace: "nowrap" }}
          >
            next Deep in{" "}
            <b className="text-accent-amber font-normal">{fridayCountdown}</b>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="text-center" style={{ lineHeight: 1.7 }}>
      {date && (
        <div
          className="text-fg font-bold"
          style={{ fontSize: "clamp(12px, 1.8dvh, 16px)", letterSpacing: "0.04em" }}
        >
          {date}
        </div>
      )}
      {number !== null && (
        <div className="text-fg-muted" style={{ fontSize: "clamp(11px, 1.7dvh, 15px)" }}>
          No. {String(number).padStart(3, "0")}
        </div>
      )}
      <div className="text-fg-muted" style={{ fontSize: "clamp(11px, 1.7dvh, 15px)" }}>
        {modeLabel}
      </div>
      {countdown && (
        <div
          className="text-fg-muted mt-1"
          style={{ fontSize: "clamp(10px, 1.6dvh, 14px)", opacity: 0.7, whiteSpace: "nowrap" }}
        >
          new puzzle in{" "}
          <b className="text-accent-amber font-normal">{countdown}</b>
        </div>
      )}
    </div>
  );
}
