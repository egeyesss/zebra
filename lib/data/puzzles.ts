/**
 * Puzzle data access. Loads the exported bundle (`data/puzzles/v1.json`) and
 * exposes the ordered pool plus lookups. The JSON is imported statically so it
 * gets bundled at build time — no filesystem reads at request time, which keeps
 * this usable from server components and route handlers on Vercel.
 *
 * `parseBundle` is the only validation seam: it sanity-checks the shape and
 * version before we trust the data. It's a deliberately light guard, not a full
 * schema validator — the generator is the source of truth, this just catches a
 * malformed or mis-versioned file early instead of letting `undefined` leak
 * into the UI.
 */

import rawBundle from "@/data/puzzles/v1.json";
import { EXPECTED_SCHEMA_VERSION } from "@/lib/config";
import type { ExportBundle, ExportedPuzzle } from "@/types/puzzle";

/**
 * Validate an unknown value as an {@link ExportBundle}. Throws with a specific
 * message on the first problem found. Returns the value typed on success.
 */
export function parseBundle(data: unknown): ExportBundle {
  if (typeof data !== "object" || data === null) {
    throw new Error("puzzle bundle must be an object");
  }
  const bundle = data as Partial<ExportBundle>;

  if (typeof bundle.schema_version !== "string") {
    throw new Error("puzzle bundle is missing schema_version");
  }
  if (bundle.schema_version !== EXPECTED_SCHEMA_VERSION) {
    throw new Error(
      `puzzle bundle schema_version ${bundle.schema_version} does not match ` +
        `expected ${EXPECTED_SCHEMA_VERSION}`,
    );
  }
  if (!Array.isArray(bundle.puzzles)) {
    throw new Error("puzzle bundle is missing a puzzles array");
  }
  if (bundle.puzzles.length === 0) {
    throw new Error("puzzle bundle contains no puzzles");
  }

  const ids = new Set<string>();
  for (const puzzle of bundle.puzzles) {
    if (typeof puzzle?.id !== "string" || puzzle.id.length === 0) {
      throw new Error("every puzzle must have a non-empty id");
    }
    if (ids.has(puzzle.id)) {
      throw new Error(`duplicate puzzle id: ${puzzle.id}`);
    }
    ids.add(puzzle.id);
  }

  return bundle as ExportBundle;
}

/** The validated bundle, parsed once at module load. */
export const bundle: ExportBundle = parseBundle(rawBundle);

/**
 * The ordered puzzle pool. Order is the schedule: day N draws index N, so this
 * order is the contract with {@link selectDailyPuzzle}.
 */
export function getPool(): ExportedPuzzle[] {
  return bundle.puzzles;
}

/** Look up a puzzle by id, or `undefined` if it isn't in the bundle. */
export function getPuzzleById(id: string): ExportedPuzzle | undefined {
  return bundle.puzzles.find((p) => p.id === id);
}

/** The Coffee (4×4) puzzle pool, in schedule order. */
export function getCoffeePool(): ExportedPuzzle[] {
  return bundle.puzzles.filter((p) => p.size === 4);
}

/** The Deep (5×5) puzzle pool, in schedule order. */
export function getDeepPool(): ExportedPuzzle[] {
  return bundle.puzzles.filter((p) => p.size === 5);
}
