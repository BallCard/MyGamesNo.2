import { describe, expect, test } from "vitest";

import { getCatRadius } from "../../src/game/config/cats";

describe("cat radius curve", () => {
  test("opens up early-game size steps for faster level recognition", () => {
    expect(getCatRadius(1)).toBe(20);
    expect(getCatRadius(2)).toBe(24);
    expect(getCatRadius(4)).toBe(33);
    expect(getCatRadius(6)).toBe(44);
    expect(getCatRadius(8)).toBe(56);
  });

  test("keeps late-game growth smooth and bounded across 18 levels", () => {
    expect(getCatRadius(12)).toBe(76);
    expect(getCatRadius(13)).toBe(81);
    expect(getCatRadius(14)).toBe(85);
    expect(getCatRadius(15)).toBe(88);
    expect(getCatRadius(16)).toBe(91);
    expect(getCatRadius(17)).toBe(94);
    expect(getCatRadius(18)).toBe(96);
  });

  test("never shrinks as level increases", () => {
    const radii = Array.from({ length: 18 }, (_, index) => getCatRadius(index + 1));
    expect(radii.every((radius, index) => index === 0 || radius >= radii[index - 1])).toBe(true);
  });
});
