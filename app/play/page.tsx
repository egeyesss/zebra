import { PlaySession } from "@/components/PlaySession";
import { getCoffeePool, getDeepPool } from "@/lib/data/puzzles";
import {
  deepPuzzleNumber,
  puzzleNumber,
  selectDailyPuzzle,
  selectDeepPuzzle,
} from "@/lib/data/selection";

export default async function PlayPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const mode = params.mode === "deep" ? "deep" : "coffee";

  if (mode === "deep") {
    const pool = getDeepPool();
    const scheduled = selectDeepPuzzle(pool);
    const puzzle = scheduled ?? pool[0] ?? getCoffeePool()[0]!;
    const isPreview = scheduled === null;
    const number = deepPuzzleNumber();
    return (
      <PlaySession
        puzzle={puzzle}
        isPreview={isPreview}
        number={number}
        track="deep"
      />
    );
  }

  const pool = getCoffeePool();
  const scheduled = selectDailyPuzzle(pool);
  const puzzle = scheduled ?? pool[0]!;
  const isPreview = scheduled === null;
  const number = puzzleNumber();
  return (
    <PlaySession
      puzzle={puzzle}
      isPreview={isPreview}
      number={number}
      track="coffee"
    />
  );
}
