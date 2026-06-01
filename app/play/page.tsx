import { PlaySession } from "@/components/PlaySession";
import { trackForSize } from "@/lib/config";
import { getPool } from "@/lib/data/puzzles";
import { puzzleNumber, selectDailyPuzzle } from "@/lib/data/selection";

export default function PlayPage() {
  const scheduled = selectDailyPuzzle(getPool());
  const puzzle = scheduled ?? getPool()[0];
  const isPreview = scheduled === null;
  const number = puzzleNumber();
  const track = trackForSize(puzzle.size);

  return (
    <PlaySession
      puzzle={puzzle}
      isPreview={isPreview}
      number={number}
      track={track}
    />
  );
}
