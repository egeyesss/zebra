"use client";

import { useState } from "react";

type Mode = "coffee" | "deep";

/**
 * Mode tabs + action buttons. Manages mode state client-side so switching
 * tabs never causes a full page reload. Uses <a href> for the tabs so the
 * correct mode is the fallback href — if JS doesn't run, the page just
 * reloads (progressive enhancement). When JS is active, we call
 * e.preventDefault() + history.replaceState() to update the URL in place,
 * then fire a "zebra:mode" CustomEvent so CountdownSection can sync its label.
 */
export function ModeSelector({
  initialMode,
  isFriday,
}: {
  initialMode: Mode;
  isFriday: boolean;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);

  function pick(m: Mode, e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    if (m === mode) return;
    setMode(m);
    history.replaceState(null, "", `/?mode=${m}`);
    window.dispatchEvent(new CustomEvent("zebra:mode", { detail: m }));
  }

  const deepUnavailable = mode === "deep" && !isFriday;

  return (
    <>
      {/* Mode tabs */}
      <div
        className="w-full flex"
        style={{
          maxWidth: "480px",
          boxShadow: "inset 0 0 0 1px var(--border)",
          borderRadius: "9999px",
        }}
      >
        {(["coffee", "deep"] as const).map((m, idx) => (
          <a
            key={m}
            href={`/?mode=${m}`}
            onClick={(e) => pick(m, e)}
            style={{
              fontFamily: "inherit",
              fontSize: "15px",
              padding: "clamp(9px, 1.5dvh, 13px) 28px",
              background: mode === m ? "var(--bg-elev-2)" : "transparent",
              color: mode === m ? "var(--fg)" : "var(--fg-muted)",
              textDecoration: "none",
              whiteSpace: "nowrap",
              transition: "background .15s, color .15s",
              borderRadius:
                idx === 0 ? "9999px 0 0 9999px" : "0 9999px 9999px 0",
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {m === "coffee" ? (
              <><span style={{ fontSize: "1.3em", marginRight: "0.35em" }}>☕️</span>Coffee · 4 × 4</>
            ) : (
              <>
                <span style={{ fontSize: "1.3em", marginRight: "0.35em" }}>🌊</span>
                Deep · 5 × 5
                <span
                  style={{
                    fontSize: "11px",
                    marginLeft: "0.4em",
                    opacity: 0.55,
                    letterSpacing: "0.08em",
                  }}
                >
                  · Fri
                </span>
              </>
            )}
          </a>
        ))}
      </div>

      {/* Action links */}
      <div
        className="mx-4 flex flex-wrap justify-center"
        style={{ gap: "14px", marginTop: "clamp(8px, 1.5dvh, 20px)" }}
      >
        <a
          href="#howto"
          className="btn-ghost rounded-full text-fg transition-colors"
          style={{
            fontFamily: "inherit",
            fontSize: "16px",
            letterSpacing: "0.02em",
            padding: "clamp(10px, 1.5dvh, 16px) clamp(28px, 4vw, 40px)",
            background: "transparent",
            textDecoration: "none",
            boxShadow: "inset 0 0 0 1px var(--border)",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          how to play
        </a>
        {deepUnavailable ? (
          <span
            style={{
              fontFamily: "inherit",
              fontSize: "16px",
              letterSpacing: "0.02em",
              padding: "clamp(10px, 1.5dvh, 16px) clamp(28px, 4vw, 40px)",
              color: "var(--fg-muted)",
              boxShadow: "inset 0 0 0 1.5px var(--border)",
              opacity: 0.4,
              borderRadius: "9999px",
              display: "inline-flex",
              alignItems: "center",
              cursor: "default",
            }}
          >
            Fridays only
          </span>
        ) : (
          <a
            href={`/play?mode=${mode}`}
            className="btn-play rounded-full transition-colors"
            style={{
              fontFamily: "inherit",
              fontSize: "16px",
              letterSpacing: "0.02em",
              padding: "clamp(10px, 1.5dvh, 16px) clamp(28px, 4vw, 40px)",
              color: "var(--accent-green)",
              boxShadow: "inset 0 0 0 1.5px var(--accent-green)",
              background: "rgba(109,191,109,0.08)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            play
          </a>
        )}
      </div>
    </>
  );
}
