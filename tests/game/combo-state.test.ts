import { describe, expect, test } from "vitest";

import { COMBO_WINDOW_MS } from "../../src/game/systems/gameplayTuning";
import {
  consumeComboMerge,
  createComboState,
  finalizeComboFrame,
  getComboBonus,
  tickComboState
} from "../../src/game/systems/comboState";

describe("combo state", () => {
  test("first merge starts a chain with no visible combo and no bonus", () => {
    const result = consumeComboMerge(createComboState());

    expect(result.nextState.comboCount).toBe(1);
    expect(result.bonus).toBe(0);
    expect(result.shouldShowCombo).toBe(false);
  });

  test("second merge inside the window yields combo 2 and a restrained bonus", () => {
    const first = consumeComboMerge(createComboState());
    const second = consumeComboMerge(first.nextState);

    expect(second.nextState.comboCount).toBe(2);
    expect(second.bonus).toBe(20);
    expect(second.shouldShowCombo).toBe(true);
  });

  test("bonus curve ramps up without overwhelming score progression", () => {
    expect(getComboBonus(1)).toBe(0);
    expect(getComboBonus(2)).toBe(20);
    expect(getComboBonus(3)).toBe(60);
    expect(getComboBonus(4)).toBe(120);
    expect(getComboBonus(5)).toBe(200);
    expect(getComboBonus(6)).toBe(320);
    expect(getComboBonus(7)).toBe(440);
  });

  test("combo timeout resets the chain to zero state", () => {
    const first = consumeComboMerge(createComboState());
    const expired = tickComboState(first.nextState, COMBO_WINDOW_MS);

    expect(expired.comboCount).toBe(0);
    expect(expired.remainingWindowMs).toBe(0);
  });

  test("a merge after timeout restarts from combo 1", () => {
    const first = consumeComboMerge(createComboState());
    const expired = tickComboState(first.nextState, COMBO_WINDOW_MS);
    const next = consumeComboMerge(expired);

    expect(next.nextState.comboCount).toBe(1);
    expect(next.bonus).toBe(0);
    expect(next.shouldShowCombo).toBe(false);
  });

  test("ticking below the window keeps the chain alive", () => {
    const first = consumeComboMerge(createComboState());
    const ticking = tickComboState(first.nextState, 700);
    const next = consumeComboMerge(ticking);

    expect(next.nextState.comboCount).toBe(2);
    expect(next.bonus).toBe(20);
  });

  test("one millisecond remaining still extends the chain but zero does not", () => {
    const first = consumeComboMerge(createComboState());

    const oneMsRemaining = tickComboState(first.nextState, COMBO_WINDOW_MS - 1);
    const extended = consumeComboMerge(oneMsRemaining);
    expect(extended.nextState.comboCount).toBe(2);

    const zeroMsRemaining = tickComboState(first.nextState, COMBO_WINDOW_MS);
    const reset = consumeComboMerge(zeroMsRemaining);
    expect(reset.nextState.comboCount).toBe(1);
  });

  test("frame finalization does not expire a combo that was refreshed by a merge this frame", () => {
    const first = consumeComboMerge(createComboState());
    const oneMsRemaining = tickComboState(first.nextState, COMBO_WINDOW_MS - 1);
    const refreshed = consumeComboMerge(oneMsRemaining);

    const finalized = finalizeComboFrame(refreshed.nextState, 16, true);

    expect(finalized.comboCount).toBe(2);
    expect(finalized.remainingWindowMs).toBe(refreshed.nextState.remainingWindowMs);
  });
});