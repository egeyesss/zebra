"use client";

import { useEffect, useRef } from "react";

interface Props {
  values: string[];
  currentValue: string | undefined;
  onCommit: (value: string) => void;
}

export function CellPicker({ values, currentValue, onCommit }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onCommitRef = useRef(onCommit);
  useEffect(() => {
    onCommitRef.current = onCommit;
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: Event) => {
      const btn = (e.target as Element).closest(
        "[data-value]",
      ) as HTMLElement | null;
      if (!btn) return;
      e.preventDefault();
      onCommitRef.current(btn.dataset.value!);
    };
    el.addEventListener("click", handler);
    return () => el.removeEventListener("click", handler);
  }, []);

  return (
    <div
      ref={containerRef}
      className="border border-border rounded-lg px-4 py-3 flex flex-wrap gap-x-2 gap-y-1 shadow-lg"
      style={{ backgroundColor: "var(--bg-elev)" }}
    >
      {values.map((v) => (
        <a
          key={v}
          href="#"
          role="button"
          data-value={v}
          className="px-2 py-1 text-sm rounded flex items-center gap-1 transition-colors hover:bg-bg-elev-2"
          style={{ color: v === currentValue ? "var(--accent-green)" : "var(--fg)" }}
        >
          {v === currentValue && (
            <span style={{ color: "var(--accent-green)" }}>●</span>
          )}
          {v}
        </a>
      ))}
    </div>
  );
}
