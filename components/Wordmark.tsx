/**
 * The brand. Lowercase mono with generous tracking — no icon, no stripes.
 * The wordmark is the brand (web-app-design.md).
 */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`tracking-[0.4em] lowercase select-none ${className}`}>
      zebra
    </span>
  );
}
