import { describe, expect, test } from "vitest";

import { getCatRadius } from "../../src/game/config/cats";

describe("cat radius curve", () => {
  test("grows gradually early and stays bounded across 18 levels", () => {
    expect(getCatRadius(1)).toBe(20);
    expect(getCatRadius(4)).toBe(26);
    expect(getCatRadius(8)).toBe(40);
    expect(getCatRadius(12)).toBe(60);
    expect(getCatRadius(18)).toBe(96);
  });

  test("keeps late-game growth smooth instead of jumping too hard", () => {
    expect(getCatRadius(13)).toBe(65);
    expect(getCatRadius(14)).toBe(71);
    expect(getCatRadius(15)).toBe(77);
    expect(getCatRadius(16)).toBe(83);
    expect(getCatRadius(17)).toBe(89);
    expect(getCatRadius(18)).toBe(96);
  });

  test("never shrinks as level increases", () => {
    const radii = Array.from({ length: 18 }, (_, index) => getCatRadius(index + 1));
    expect(radii.every((radius, index) => index === 0 || radius >= radii[index - 1])).toBe(true);
  });
});
