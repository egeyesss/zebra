/**
 * Timer + overwrites HUD — STATIC placeholder.
 *
 * Renders the top-center "MM:SS / N" display from the design doc. There is no
 * timer or scoring logic yet; the values are props with inert defaults. The
 * real ticking clock, amber/red warnings, and overwrite counter land in a
 * later session.
 */
export function Hud({
  timeLabel = "00:00",
  overwrites = 0,
}: {
  timeLabel?: string;
  overwrites?: number;
}) {
  return (
    <div className="flex items-baseline justify-center gap-3">
      <span className="text-5xl font-bold tabular-nums sm:text-6xl">
        {timeLabel}
      </span>
      <span className="text-fg-muted text-2xl">/ {overwrites}</span>
    </div>
  );
}
