/**
 * In-memory fixed-window rate limiter for API route handlers.
 *
 * Caveat worth knowing: counters live in the function process, not a shared
 * store. On Vercel Fluid Compute each warm instance keeps its own map, so the
 * real global ceiling is roughly (limit × live instances). This is a
 * deliberate, zero-dependency first line of defense — it stops a single client
 * from hammering one instance and burning CPU/DB. For hard global limits, front
 * these routes with Vercel WAF rate rules or move the counter to a shared store
 * (e.g. Upstash Redis on the Marketplace).
 */

interface Bucket {
  count: number;
  resetAt: number; // epoch ms when the window rolls over
}

const buckets = new Map<string, Bucket>();

// Sweep expired buckets once the map gets large enough to be worth it, so a
// stream of unique keys (e.g. spoofed IPs) can't grow memory without bound.
const SWEEP_THRESHOLD = 10_000;

function sweep(now: number): void {
  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) buckets.delete(key);
  }
}

export interface RateLimitResult {
  ok: boolean;
  /** Requests left in the current window (0 once blocked). */
  remaining: number;
  /** Seconds until the window resets — use for the Retry-After header. */
  retryAfterSeconds: number;
}

/**
 * Records a hit against `key` and reports whether it's within `limit` requests
 * per `windowMs`. The first hit in a window opens it; subsequent hits count
 * against the same window until it expires.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();

  if (buckets.size > SWEEP_THRESHOLD) sweep(now);

  const existing = buckets.get(key);
  if (!existing || now >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  existing.count += 1;
  const ok = existing.count <= limit;
  return {
    ok,
    remaining: Math.max(0, limit - existing.count),
    retryAfterSeconds: ok ? 0 : Math.ceil((existing.resetAt - now) / 1000),
  };
}

/**
 * Best-effort client IP from the proxy headers Vercel sets. Falls back to a
 * shared "unknown" bucket when no header is present (e.g. local dev), which
 * just means those callers share one limit — acceptable for a coarse guard.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/** Standard 429 response with a Retry-After header. */
export function tooManyRequests(retryAfterSeconds: number): Response {
  return Response.json(
    { error: "rate_limited" },
    {
      status: 429,
      headers: { "Retry-After": String(Math.max(1, retryAfterSeconds)) },
    },
  );
}
