import { auth } from "@/auth";
import { getServerPuzzleSession, saveServerPuzzleSession } from "@/lib/db";
import { resetZoneDate } from "@/lib/data/selection";
import { getPuzzleById } from "@/lib/data/puzzles";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";
import type { PuzzleSession } from "@/lib/storage/session";

// A solved/in-progress session for the largest (5×5) grid is a few hundred
// bytes. Cap the persisted payload well above that but low enough that a signed
// -in client can't write multi-megabyte blobs into Postgres.
const MAX_SESSION_BYTES = 8 * 1024;

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

  // Only persist sessions for puzzles we actually ship — otherwise a client can
  // seed the table with rows under arbitrary puzzle_ids.
  if (!getPuzzleById(s.puzzleId)) {
    return Response.json({ error: "unknown_puzzle" }, { status: 400 });
  }

  // Bound the stored payload. The unbounded `committed`/`notes`/`overwrittenCells`
  // fields would otherwise let a signed-in client write arbitrarily large blobs.
  if (Buffer.byteLength(JSON.stringify(s)) > MAX_SESSION_BYTES) {
    return Response.json({ error: "session_too_large" }, { status: 413 });
  }

  try {
    await saveServerPuzzleSession(session.user.id, s as PuzzleSession);
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/session]", err);
    return Response.json({ error: "db_unavailable" }, { status: 503 });
  }
}
