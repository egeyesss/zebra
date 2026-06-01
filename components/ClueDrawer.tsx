"use client";

import { useEffect, useRef, useState } from "react";

import type { ExportedClue } from "@/types/puzzle";

import { CluePanel } from "./CluePanel";

export function ClueDrawer({ clues }: { clues: ExportedClue[] }) {
  const [expanded, setExpanded] = useState(false);
  const handleRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = handleRef.current;
    if (!el) return;
    const handler = (e: Event) => {
      e.preventDefault();
      setExpanded((prev) => !prev);
    };
    el.addEventListener("click", handler);
    return () => el.removeEventListener("click", handler);
  }, []);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 h-[70vh] bg-bg-elev border-t border-border transition-transform duration-200 lg:hidden flex flex-col"
      style={{
        transform: expanded
          ? "translateY(0)"
          : "translateY(calc(100% - 3.5rem))",
      }}
    >
      <a
        ref={handleRef}
        href="#"
        role="button"
        className="flex items-center gap-2 w-full px-4 h-14 shrink-0 text-fg-muted text-sm"
      >
        <span>{expanded ? "▼" : "▲"}</span>
        <span>Clues ({clues.length})</span>
      </a>
      <div className="flex-1 overflow-y-auto px-4 py-3 border-t border-border">
        <CluePanel clues={clues} />
      </div>
    </div>
  );
}
