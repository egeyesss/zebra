import { auth } from "@/auth";
import { getServerPuzzleSession, saveServerPuzzleSession } from "@/lib/db";
import { resetZoneDate } from "@/lib/data/selection";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";
import type { PuzzleSession } from "@/lib/storage/session";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const limit = rateLimit(`session:get:${session.user.id}`, 60, 60_000);
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

  const { searchParams } = new URL(request.url);
  const puzzleId = searchParams.get("puzzleId");
  if (!puzzleId) {
    return Response.json({ error: "missing_puzzle_id" }, { status: 400 });
  }

  try {
    const puzzleSession = await getServerPuzzleSession(session.user.id, puzzleId);
    return Response.json(puzzleSession ?? null);
  } catch (err) {
    console.error("[GET /api/session]", err);
    return Response.json({ error: "db_unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const limit = rateLimit(`session:post:${session.user.id}`, 30, 60_000);
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  const s = body as Partial<PuzzleSession>;
  if (
    !s ||
    s.v !== 1 ||
    typeof s.puzzleId !== "string" ||
    typeof s.date !== "string" ||
    typeof s.committed !== "object"
  ) {
    return Response.json({ error: "invalid_session" }, { status: 400 });
  }

  if (s.date !== resetZoneDate()) {
    return Response.json({ error: "invalid_date" }, { status: 400 });
  }

  try {
    await saveServerPuzzleSession(session.user.id, s as PuzzleSession);
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/session]", err);
    return Response.json({ error: "db_unavailable" }, { status: 503 });
  }
}
