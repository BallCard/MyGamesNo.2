import { describe, expect, test } from "vitest";

import { getCatRadius } from "../../src/game/config/cats";

describe("playfield sizing assumptions", () => {
  test("keeps early-game cats comfortable and caps the new 18th level below a quarter width", () => {
    expect(getCatRadius(1)).toBeLessThan(24);
    expect(getCatRadius(8)).toBeLessThan(50);
    expect(getCatRadius(18)).toBeLessThan(112);
  });
});
