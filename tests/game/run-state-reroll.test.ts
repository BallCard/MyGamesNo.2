import { describe, expect, test } from "vitest";

import { createRunState, rerollQueuedNext } from "../../src/game/systems/runState";

describe("rerollQueuedNext", () => {
  test("keeps score and cooldown but advances the queued next roll", () => {
    const initial = createRunState(123);
    const rerolled = rerollQueuedNext(initial);

    expect(rerolled.score).toBe(initial.score);
    expect(rerolled.cooldownMs).toBe(initial.cooldownMs);
    expect(rerolled.randomSeed).not.toBe(initial.randomSeed);
    expect(rerolled.queuedNext).not.toEqual(initial.queuedNext);
  });
});
