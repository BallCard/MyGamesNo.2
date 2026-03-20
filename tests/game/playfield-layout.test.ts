import { describe, expect, test } from "vitest";

import { getCatRadius } from "../../src/game/config/cats";

describe("playfield sizing assumptions", () => {
  test("keeps early-game cats comfortably below the widened bottom boundary", () => {
    expect(getCatRadius(1)).toBeLessThan(24);
    expect(getCatRadius(8)).toBeLessThan(50);
  });
});
