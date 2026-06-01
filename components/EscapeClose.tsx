"use client";

import { useEffect } from "react";

interface Props {
  /** Navigate here when Escape is pressed. Use "#_" to close a :target overlay. */
  closeTo: string;
  /** If set, only act when window.location.hash matches this (without the #). */
  activeHash?: string;
}

/**
 * Invisible component — attaches a keydown listener and navigates to `closeTo`
 * when the user presses Escape (optionally only when `activeHash` is active).
 * Drop it inside any CSS :target overlay or page that should close on Escape.
 */
export function EscapeClose({ closeTo, activeHash }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (activeHash && window.location.hash !== `#${activeHash}`) return;
      if (closeTo.startsWith("#")) {
        window.location.hash = closeTo.slice(1);
      } else {
        window.location.href = closeTo;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [closeTo, activeHash]);

  return null;
}
