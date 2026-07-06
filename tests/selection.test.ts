import { describe, expect, it } from "vitest";

import {
  dayIndex,
  deepPuzzleIndex,
  deepPuzzleNumber,
  isFridayInToronto,
  puzzleNumber,
  resetZoneDate,
  selectDailyPuzzle,
  selectDeepPuzzle,
} from "@/lib/data/selection";
import type { ExportedPuzzle } from "@/types/puzzle";

// A throwaway pool; selection only touches `id` / array index here.
const fakePool = [
  { id: "p0" },
  { id: "p1" },
  { id: "p2" },
] as unknown as ExportedPuzzle[];

describe("resetZoneDate", () => {
  it("formats the date in America/Toronto, not UTC", () => {
    // 02:00 UTC on Jun 1 is still May 31 in Toronto (EDT, UTC-4).
    expect(resetZoneDate(new Date("2026-06-01T02:00:00Z"))).toBe("2026-05-31");
    // Midday UTC lands on the same calendar day.
    expect(resetZoneDate(new Date("2026-06-01T12:00:00Z"))).toBe("2026-06-01");
  });
});

describe("dayIndex", () => {
  it("is 0 on the launch date and increments per Toronto day", () => {
    expect(dayIndex(new Date("2026-06-11T12:00:00Z"))).toBe(0);
    expect(dayIndex(new Date("2026-06-12T12:00:00Z"))).toBe(1);
    expect(dayIndex(new Date("2026-06-20T12:00:00Z"))).toBe(9);
  });

  it("is negative before launch", () => {
    expect(dayIndex(new Date("2026-06-09T12:00:00Z"))).toBe(-2);
  });
});

describe("puzzleNumber", () => {
  it("is one-based from launch and null before it", () => {
    expect(puzzleNumber(new Date("2026-06-11T12:00:00Z"))).toBe(1);
    expect(puzzleNumber(new Date("2026-06-13T12:00:00Z"))).toBe(3);
    expect(puzzleNumber(new Date("2026-06-09T12:00:00Z"))).toBeNull();
  });
});

describe("selectDailyPuzzle", () => {
  it("draws the pool sequentially by day", () => {
    expect(
      selectDailyPuzzle(fakePool, new Date("2026-06-11T12:00:00Z"))?.id,
    ).toBe("p0");
    expect(
      selectDailyPuzzle(fakePool, new Date("2026-06-13T12:00:00Z"))?.id,
    ).toBe("p2");
  });

  it("returns null before launch", () => {
    expect(
      selectDailyPuzzle(fakePool, new Date("2026-06-09T12:00:00Z")),
    ).toBeNull();
  });

  it("wraps back to the start once the bank is exhausted", () => {
    // Day 3 with a 3-puzzle pool → replay p0, day 5 → p2.
    expect(
      selectDailyPuzzle(fakePool, new Date("2026-06-14T12:00:00Z"))?.id,
    ).toBe("p0");
    expect(
      selectDailyPuzzle(fakePool, new Date("2026-06-16T12:00:00Z"))?.id,
    ).toBe("p2");
  });

  it("returns null for an empty pool", () => {
    expect(
      selectDailyPuzzle([], new Date("2026-06-14T12:00:00Z")),
    ).toBeNull();
  });
});

// LAUNCH_DATE is 2026-06-11 (Thursday). First Friday since launch = 2026-06-12.
describe("isFridayInToronto", () => {
  it("is true on a Friday", () => {
    expect(isFridayInToronto(new Date("2026-06-12T12:00:00Z"))).toBe(true);
    expect(isFridayInToronto(new Date("2026-06-19T12:00:00Z"))).toBe(true);
  });

  it("is false on non-Fridays", () => {
    expect(isFridayInToronto(new Date("2026-06-11T12:00:00Z"))).toBe(false); // Thursday
    expect(isFridayInToronto(new Date("2026-06-13T12:00:00Z"))).toBe(false); // Saturday
  });
});

describe("deepPuzzleIndex", () => {
  it("is 0 on the first Friday since launch", () => {
    expect(deepPuzzleIndex(new Date("2026-06-12T12:00:00Z"))).toBe(0);
  });

  it("increments once per Friday", () => {
    expect(deepPuzzleIndex(new Date("2026-06-19T12:00:00Z"))).toBe(1);
    expect(deepPuzzleIndex(new Date("2026-06-26T12:00:00Z"))).toBe(2);
  });

  it("is -1 on non-Friday days", () => {
    expect(deepPuzzleIndex(new Date("2026-06-11T12:00:00Z"))).toBe(-1); // Thursday (launch day)
    expect(deepPuzzleIndex(new Date("2026-06-13T12:00:00Z"))).toBe(-1); // Saturday
  });

  it("is -1 before launch", () => {
    expect(deepPuzzleIndex(new Date("2026-06-05T12:00:00Z"))).toBe(-1); // Friday before launch
  });
});

describe("deepPuzzleNumber", () => {
  it("is one-based on Fridays and null otherwise", () => {
    expect(deepPuzzleNumber(new Date("2026-06-12T12:00:00Z"))).toBe(1);
    expect(deepPuzzleNumber(new Date("2026-06-19T12:00:00Z"))).toBe(2);
    expect(deepPuzzleNumber(new Date("2026-06-11T12:00:00Z"))).toBeNull();
  });
});

describe("selectDeepPuzzle", () => {
  it("draws the Deep pool sequentially by Friday", () => {
    expect(selectDeepPuzzle(fakePool, new Date("2026-06-12T12:00:00Z"))?.id).toBe("p0");
    expect(selectDeepPuzzle(fakePool, new Date("2026-06-19T12:00:00Z"))?.id).toBe("p1");
    expect(selectDeepPuzzle(fakePool, new Date("2026-06-26T12:00:00Z"))?.id).toBe("p2");
  });

  it("returns null on non-Friday days", () => {
    expect(selectDeepPuzzle(fakePool, new Date("2026-06-11T12:00:00Z"))).toBeNull();
  });

  it("wraps back to the start once the Deep bank is exhausted", () => {
    // 4th Friday with a 3-puzzle pool → replay p0.
    expect(selectDeepPuzzle(fakePool, new Date("2026-07-03T12:00:00Z"))?.id).toBe("p0");
  });

  it("returns null for an empty pool", () => {
    expect(selectDeepPuzzle([], new Date("2026-07-03T12:00:00Z"))).toBeNull();
  });
});
