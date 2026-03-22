import { describe, expect, it } from "vitest";

import { buildResultPayload, isNewBest } from "../../src/game/systems/resultState";

describe("resultState", () => {
  it("builds a frozen payload with score, peak level, best score, and new-best flag", () => {
    const payload = buildResultPayload({ score: 1200, peakLevel: 6, bestScore: 900 });

    expect(payload).toEqual({
      score: 1200,
      peakLevel: 6,
      bestScore: 900,
      isNewBest: true
    });
  });

  it("computes new-best state only when score exceeds the stored best", () => {
    expect(isNewBest(1200, 900)).toBe(true);
    expect(isNewBest(1200, 1200)).toBe(false);
    expect(isNewBest(900, 1200)).toBe(false);
  });

  it("marks a run as new best only when score beats the stored best", () => {
    expect(buildResultPayload({ score: 1200, peakLevel: 6, bestScore: 900 }).isNewBest).toBe(true);
    expect(buildResultPayload({ score: 1200, peakLevel: 6, bestScore: 1200 }).isNewBest).toBe(false);
  });
});
