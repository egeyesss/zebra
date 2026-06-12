import { auth } from "@/auth";
import {
  getServerStreak,
  migrateLocalStreak,
  recordServerResult,
} from "@/lib/db";
import { resetZoneDate } from "@/lib/data/selection";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";
import type { StreakState } from "@/types/streak";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const limit = rateLimit(`streak:get:${session.user.id}`, 60, 60_000);
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);
  try {
    const streak = await getServerStreak(session.user.id);
    return Response.json(streak);
  } catch (err) {
    console.error("[GET /api/streak]", err);
    return Response.json({ error: "db_unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const limit = rateLimit(`streak:post:${session.user.id}`, 20, 60_000);
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;

  try {
    if (b.type === "result") {
      const { solved, date } = b;
      if (typeof solved !== "boolean" || typeof date !== "string") {
        return Response.json({ error: "invalid_fields" }, { status: 400 });
      }
      // Reject any date that isn't today in the reset timezone — prevents back-dating.
      if (date !== resetZoneDate()) {
        return Response.json({ error: "invalid_date" }, { status: 400 });
      }
      const streak = await recordServerResult(session.user.id, { solved, date });
      return Response.json(streak);
    }

    if (b.type === "migrate") {
      const { current, longest, lastPlayedDate } = b as {
        current: unknown;
        longest: unknown;
        lastPlayedDate: unknown;
      };
      if (
        typeof current !== "number" ||
        typeof longest !== "number" ||
        current < 0 ||
        current > 365 ||
        longest < 0 ||
        longest > 365
      ) {
        return Response.json({ error: "invalid_fields" }, { status: 400 });
      }
      const local: StreakState = {
        current,
        longest,
        lastPlayedDate: typeof lastPlayedDate === "string" ? lastPlayedDate : null,
      };
      const streak = await migrateLocalStreak(session.user.id, local);
      return Response.json(streak);
    }

    return Response.json({ error: "unknown_type" }, { status: 400 });
  } catch (err) {
    console.error("[POST /api/streak]", err);
    return Response.json({ error: "db_unavailable" }, { status: 503 });
  }
}
