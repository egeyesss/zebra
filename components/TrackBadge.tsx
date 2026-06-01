import { TRACKS } from "@/lib/config";
import type { Track } from "@/types/puzzle";

/** Small "☕ Coffee" / "🌊 Deep" label for the current track. */
export function TrackBadge({ track }: { track: Track }) {
  const config = TRACKS[track];
  return (
    <span className="text-fg-muted text-sm">
      <span style={{ fontSize: "1.3em", marginRight: "0.35em" }}>{config.emoji}</span>{config.label}
    </span>
  );
}
