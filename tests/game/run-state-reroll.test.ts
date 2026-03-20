import { describe, expect, test } from "vitest";

import { getUnlockedMaxDropLevel } from "../../src/game/config/cats";
import { createRunState, rerollQueuedNext } from "../../src/game/systems/runState";

describe("rerollQueuedNext", () => {
  test("keeps score and cooldown while rerolling within the unlocked drop band", () => {
    const initial = createRunState(123);
    const rerolled = rerollQueuedNext(initial);

    expect(rerolled.score).toBe(initial.score);
    expect(rerolled.cooldownMs).toBe(initial.cooldownMs);
    expect(rerolled.randomSeed).not.toBe(initial.randomSeed);
    expect(rerolled.queuedNext.level).toBeGreaterThanOrEqual(1);
    expect(rerolled.queuedNext.level).toBeLessThanOrEqual(getUnlockedMaxDropLevel(initial.score));
  });
});
