import { describe, expect, test } from "vitest";

import {
  createDangerState,
  shouldCountDangerCandidate,
  updateDangerState
} from "../../src/game/systems/dangerSystem";

describe("updateDangerState", () => {
  test("does not accumulate when the cat is above the line but unstable", () => {
    const initial = createDangerState();
    const next = updateDangerState(initial, {
      deltaMs: 500,
      isAboveLine: true,
      isStable: false,
      immunityMs: 0
    });

    expect(next.accumulatedMs).toBe(0);
    expect(next.isGameOver).toBe(false);
  });

  test("accumulates while a stable cat stays above the line", () => {
    const initial = createDangerState();
    const next = updateDangerState(initial, {
      deltaMs: 1200,
      isAboveLine: true,
      isStable: true,
      immunityMs: 0
    });

    expect(next.accumulatedMs).toBe(1200);
    expect(next.isGameOver).toBe(false);
  });

  test("decays quickly once danger is gone", () => {
    const initial = {
      ...createDangerState(),
      accumulatedMs: 1000
    };
    const next = updateDangerState(initial, {
      deltaMs: 400,
      isAboveLine: false,
      isStable: false,
      immunityMs: 0
    });

    expect(next.accumulatedMs).toBeLessThan(1000);
    expect(next.accumulatedMs).toBe(200);
    expect(next.isGameOver).toBe(false);
  });

  test("blocks accumulation while red-line immunity is active", () => {
    const initial = createDangerState();
    const next = updateDangerState(initial, {
      deltaMs: 800,
      isAboveLine: true,
      isStable: true,
      immunityMs: 1200
    });

    expect(next.accumulatedMs).toBe(0);
    expect(next.immunityMs).toBe(400);
  });

  test("flags game over at the configured threshold", () => {
    const initial = {
      ...createDangerState(),
      accumulatedMs: 1800
    };
    const next = updateDangerState(initial, {
      deltaMs: 500,
      isAboveLine: true,
      isStable: true,
      immunityMs: 0
    });

    expect(next.accumulatedMs).toBe(2200);
    expect(next.isGameOver).toBe(true);
  });
});

describe("shouldCountDangerCandidate", () => {
  test("ignores freshly spawned cats above the line", () => {
    expect(
      shouldCountDangerCandidate({
        topY: 160,
        redLineY: 210,
        speed: 0,
        ageMs: 120
      })
    ).toBe(false);
  });

  test("counts only settled cats above the line after grace age", () => {
    expect(
      shouldCountDangerCandidate({
        topY: 180,
        redLineY: 210,
        speed: 0.2,
        ageMs: 900
      })
    ).toBe(true);
  });
});
