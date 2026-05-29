import { describe, expect, it } from "vitest";

import v1 from "@/data/puzzles/v1.json";
import {
  bundle,
  getPool,
  getPuzzleById,
  parseBundle,
} from "@/lib/data/puzzles";
import type { RawClue } from "@/types/puzzle";

const KNOWN_CLUE_TYPES = new Set<RawClue["type"]>([
  "positive_association",
  "negative_association",
  "absolute_position",
  "adjacency",
  "relative_position",
  "immediate_left_of",
  "disjunction",
  "conditional",
]);

describe("parseBundle", () => {
  it("accepts the shipped v1.json", () => {
    expect(() => parseBundle(v1)).not.toThrow();
    expect(parseBundle(v1).schema_version).toBe("1.0.1");
  });

  it("rejects non-objects", () => {
    expect(() => parseBundle(null)).toThrow(/must be an object/);
    expect(() => parseBundle(42)).toThrow(/must be an object/);
  });

  it("rejects a missing or mismatched schema_version", () => {
    expect(() => parseBundle({ puzzles: [] })).toThrow(/schema_version/);
    expect(() =>
      parseBundle({ schema_version: "9.9.9", puzzles: [{ id: "x" }] }),
    ).toThrow(/does not match/);
  });

  it("rejects an empty or missing puzzles array", () => {
    expect(() => parseBundle({ schema_version: "1.0.1" })).toThrow(
      /puzzles array/,
    );
    expect(() => parseBundle({ schema_version: "1.0.1", puzzles: [] })).toThrow(
      /no puzzles/,
    );
  });

  it("rejects duplicate puzzle ids", () => {
    expect(() =>
      parseBundle({
        schema_version: "1.0.1",
        puzzles: [{ id: "dup" }, { id: "dup" }],
      }),
    ).toThrow(/duplicate puzzle id/);
  });
});

describe("loader lookups", () => {
  it("exposes a non-empty pool", () => {
    expect(getPool().length).toBeGreaterThan(0);
    expect(bundle.puzzles).toBe(getPool());
  });

  it("finds puzzles by id and returns undefined for unknown ids", () => {
    expect(getPuzzleById("mock-restaurant-001")).toBeDefined();
    expect(getPuzzleById("does-not-exist")).toBeUndefined();
  });
});

describe("mock fixture integrity", () => {
  const puzzle = getPuzzleById("mock-restaurant-001")!;

  it("has self-consistent size, solution, and metrics", () => {
    // Every category's value pool and solution row matches the grid size.
    for (const values of Object.values(puzzle.theme.attributes)) {
      expect(values.length).toBe(puzzle.size);
    }
    for (const row of Object.values(puzzle.solution.assignments)) {
      expect(row.length).toBe(puzzle.size);
    }
    expect(puzzle.metrics?.clue_count).toBe(puzzle.clues.length);
  });

  it("only uses known clue types", () => {
    for (const clue of puzzle.clues) {
      expect(KNOWN_CLUE_TYPES.has(clue.raw.type)).toBe(true);
    }
  });
});
