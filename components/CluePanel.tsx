"use client";

import { useLayoutEffect, useRef } from "react";

import type { ExportedClue } from "@/types/puzzle";

const BASE_FONT_PX = 14;
const MIN_FONT_PX = 9;

export function CluePanel({ clues }: { clues: ExportedClue[] }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const list = listRef.current;
    if (!wrapper || !list) return;

    function fit() {
      if (!wrapper || !list) return;
      // Reset to base to get accurate natural height measurement.
      list.style.fontSize = `${BASE_FONT_PX}px`;
      const needed = list.scrollHeight;
      const available = wrapper.clientHeight;
      if (needed > available) {
        // Scale proportionally. Smaller font = more chars per line = fewer
        // wrapped lines, so the scaled list will always fit (never re-overflow).
        const scaled = Math.max(BASE_FONT_PX * (available / needed), MIN_FONT_PX);
        list.style.fontSize = `${scaled.toFixed(2)}px`;
      }
    }

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrapper);
    return () => ro.disconnect();
  }, [clues.length]);

  return (
    <div ref={wrapperRef} className="min-h-0 flex-1 overflow-hidden">
      <ol
        ref={listRef}
        className="flex flex-col"
        // gap in em so it scales with font size automatically
        style={{ fontSize: `${BASE_FONT_PX}px`, gap: "0.6em", lineHeight: 1.4 }}
      >
        {clues.map((clue, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-fg-muted shrink-0 tabular-nums">{i + 1}.</span>
            <span>{clue.text}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
