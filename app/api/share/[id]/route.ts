import { getPuzzleById } from "@/lib/data/puzzles";

/**
 * Share-card endpoint — STUB.
 *
 * This will server-render a 1080×1080 PNG result card with `satori` (big mono
 * numbers: time + overwrites, or the DNF line). For now it just validates the
 * puzzle id and returns 501 so the route, its dynamic segment, and the data
 * lookup are wired and reviewable. The score/time will come from query params
 * once scoring exists.
 *
 *   TODO(share): render the result card with satori / next/og ImageResponse.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!getPuzzleById(id)) {
    return Response.json({ error: `unknown puzzle: ${id}` }, { status: 404 });
  }

  return Response.json(
    {
      status: "not_implemented",
      message: "satori share-card rendering is not built yet",
      puzzleId: id,
    },
    { status: 501 },
  );
}
