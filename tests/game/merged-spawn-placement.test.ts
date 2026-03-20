import { describe, expect, test } from "vitest";

import { getMergedSpawnPlacement } from "../../src/game/systems/physicsPolicy";

describe("merged spawn placement", () => {
  test("lifts larger merged balls above the source pair to avoid overlap lock", () => {
    const placement = getMergedSpawnPlacement({
      leftX: 100,
      leftY: 580,
      leftRadius: 28,
      rightX: 132,
      rightY: 584,
      rightRadius: 28,
      mergedRadius: 34
    });

    expect(placement.x).toBe(116);
    expect(placement.y).toBeLessThan(552);
  });
});
