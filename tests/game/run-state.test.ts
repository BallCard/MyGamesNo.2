import { describe, expect, test } from "vitest";

import { DROP_COOLDOWN_MS, SCORE_UNLOCKS } from "../../src/game/systems/gameplayTuning";
import {
  getCatDefinition,
  getDropVariantPool,
  getUnlockedMaxDropLevel,
  getUnlockProgress
} from "../../src/game/config/cats";
import {
  awardScore,
  createRunState,
  dropCurrentCat,
  rollQueuedCat,
  tickRunState
} from "../../src/game/systems/runState";

describe("run state", () => {
  test("starts with score zero and a level-1 queued next cat", () => {
    const state = createRunState(123);

    expect(state.score).toBe(0);
    expect(state.queuedNext.level).toBe(1);
    expect(state.cooldownMs).toBe(0);
  });

  test("dropping consumes the queued cat and keeps early rolls within the unlocked band", () => {
    const state = createRunState(123);
    const previousNext = state.queuedNext;

    const result = dropCurrentCat(state);

    expect(result.droppedCat).toEqual(previousNext);
    expect(result.nextState.queuedNext.level).toBe(1);
    expect(result.nextState.cooldownMs).toBe(DROP_COOLDOWN_MS);
  });

  test("cannot drop again while cooldown is active", () => {
    const state = createRunState(123);
    const firstDrop = dropCurrentCat(state);
    const secondDrop = dropCurrentCat(firstDrop.nextState);

    expect(secondDrop.droppedCat).toBeNull();
    expect(secondDrop.nextState.cooldownMs).toBe(DROP_COOLDOWN_MS);
  });

  test("cooldown ticks down over time", () => {
    const state = createRunState(123);
    const dropped = dropCurrentCat(state);

    const tickDelta = 80;
    const afterTick = tickRunState(dropped.nextState, tickDelta);

    expect(afterTick.cooldownMs).toBe(DROP_COOLDOWN_MS - tickDelta);
  });

  test("awards score without changing queued next or cooldown", () => {
    const state = createRunState(123);
    const next = awardScore(state, 40);

    expect(next.score).toBe(40);
    expect(next.queuedNext).toEqual(state.queuedNext);
    expect(next.cooldownMs).toBe(state.cooldownMs);
  });

  test("unlocks higher direct-drop levels more gradually, capped at level 8", () => {
    for (const unlock of SCORE_UNLOCKS) {
      expect(getUnlockedMaxDropLevel(unlock.minScore)).toBe(unlock.maxLevel);
    }
    expect(getUnlockedMaxDropLevel(999999)).toBe(8);
  });

  test("reports unlock progress toward the next direct-drop tier", () => {
    expect(getUnlockProgress(0)).toMatchObject({ currentMaxLevel: 1, nextMaxLevel: 2, progressRatio: 0 });
    expect(getUnlockProgress(SCORE_UNLOCKS[1].minScore / 2).progressRatio).toBeCloseTo(0.5, 1);
    expect(getUnlockProgress((SCORE_UNLOCKS[1].minScore + SCORE_UNLOCKS[2].minScore) / 2)).toMatchObject({ currentMaxLevel: 2, nextMaxLevel: 3 });
    expect(getUnlockProgress(9000)).toMatchObject({ currentMaxLevel: 7, nextMaxLevel: 8 });
    expect(getUnlockProgress(20000)).toMatchObject({ currentMaxLevel: 8, nextMaxLevel: null, progressRatio: 1 });
  });

  test("rollQueuedCat never exceeds the unlocked max level", () => {
    const low = rollQueuedCat(123, 0);
    const mid = rollQueuedCat(456, 250);
    const high = rollQueuedCat(789, 8000);

    expect(low.queued.level).toBe(1);
    expect(mid.queued.level).toBeLessThanOrEqual(3);
    expect(high.queued.level).toBeLessThanOrEqual(8);
  });

  test("never direct-drops level 9 or above even at very high scores", () => {
    for (let seed = 1; seed <= 24; seed += 1) {
      const rolled = rollQueuedCat(seed, 999999).queued;
      expect(rolled.level).toBeLessThanOrEqual(8);
    }
  });

  test("avoids repeating the exact same high-level variant when alternates exist", () => {
    const previous = {
      level: 12,
      assetKey: getDropVariantPool(12)[0]
    };

    const rerolled = rollQueuedCat(1, 9000, previous).queued;

    expect(rerolled.level).toBeLessThanOrEqual(8);
    expect(getCatDefinition(1)?.assetKey).toBe("cat-1");
  });
});

