import { auth } from "@/auth";
import { DeepGate } from "@/components/DeepGate";
import { PlaySession } from "@/components/PlaySession";
import { getServerPuzzleSession } from "@/lib/db";
import { getCoffeePool, getDeepPool } from "@/lib/data/puzzles";
import {
  deepPuzzleNumber,
  isFridayInToronto,
  puzzleNumber,
  resetZoneDate,
  selectDailyPuzzle,
  selectDeepPuzzle,
} from "@/lib/data/selection";
import type { PuzzleSession } from "@/lib/storage/session";

async function fetchServerSession(userId: string, puzzleId: string): Promise<PuzzleSession | null> {
  try {
    const s = await getServerPuzzleSession(userId, puzzleId);
    // Discard if it's stale (wrong day)
    if (s?.date !== resetZoneDate()) return null;
    return s;
  } catch {
    return null;
  }
}

export default async function PlayPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const mode = params.mode === "deep" ? "deep" : "coffee";

  const userSession = await auth();
  const userId = userSession?.user?.id ?? null;

  if (mode === "deep") {
    if (!isFridayInToronto()) {
      return <DeepGate />;
    }
    const pool = getDeepPool();
    const scheduled = selectDeepPuzzle(pool);
    const puzzle = scheduled ?? pool[0] ?? getCoffeePool()[0]!;
    const isPreview = scheduled === null;
    const number = deepPuzzleNumber();
    const serverSession = userId && !isPreview ? await fetchServerSession(userId, puzzle.id) : null;
    return (
      <PlaySession
        puzzle={puzzle}
        isPreview={isPreview}
        number={number}
        track="deep"
        serverSession={serverSession}
      />
    );
  }

  const pool = getCoffeePool();
  const scheduled = selectDailyPuzzle(pool);
  const puzzle = scheduled ?? pool[0]!;
  const isPreview = scheduled === null;
  const number = puzzleNumber();
  const serverSession = userId && !isPreview ? await fetchServerSession(userId, puzzle.id) : null;
  return (
    <PlaySession
      puzzle={puzzle}
      isPreview={isPreview}
      number={number}
      track="coffee"
      serverSession={serverSession}
    />
  );
}
