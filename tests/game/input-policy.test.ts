import { describe, expect, test } from "vitest";

import {
  getPointerUpSuppression,
  resolvePointerDownSuppression,
  shouldDropOnPointerUp,
} from "../../src/game/systems/inputPolicy";

describe("input policy", () => {
  test("blocks drops while a target tool is active", () => {
    expect(
      shouldDropOnPointerUp({
        isGameOver: false,
        hasActiveTargetTool: true,
        suppression: "none",
      }),
    ).toBe(false);
  });

  test("blocks drops while game over is active", () => {
    expect(
      shouldDropOnPointerUp({
        isGameOver: true,
        hasActiveTargetTool: false,
        suppression: "none",
      }),
    ).toBe(false);
  });

  test("blocks drops while playfield suppression is active", () => {
    expect(
      shouldDropOnPointerUp({
        isGameOver: false,
        hasActiveTargetTool: false,
        suppression: "playfield",
      }),
    ).toBe(false);
  });

  test("allows normal gameplay pointerup drops", () => {
    expect(
      shouldDropOnPointerUp({
        isGameOver: false,
        hasActiveTargetTool: false,
        suppression: "none",
      }),
    ).toBe(true);
  });

  test("overlay actions do not suppress the next gameplay gesture", () => {
    expect(getPointerUpSuppression("overlay")).toBe("none");
    expect(getPointerUpSuppression("playfield")).toBe("playfield");
  });

  test("starting a new aim clears stale suppression when no target tool is active", () => {
    expect(resolvePointerDownSuppression("playfield", false)).toBe("none");
    expect(resolvePointerDownSuppression("none", false)).toBe("none");
    expect(resolvePointerDownSuppression("playfield", true)).toBe("playfield");
  });
});
