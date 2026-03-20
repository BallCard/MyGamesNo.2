import { describe, expect, test } from "vitest";

import { getCatRadius } from "../../src/game/config/cats";

describe("cat radius curve", () => {
  test("grows gradually early and opens up more at higher levels", () => {
    expect(getCatRadius(1)).toBe(20);
    expect(getCatRadius(4)).toBe(27);
    expect(getCatRadius(8)).toBe(45);
    expect(getCatRadius(12)).toBe(79);
  });

  test("never shrinks as level increases", () => {
    const radii = Array.from({ length: 12 }, (_, index) => getCatRadius(index + 1));
    expect(radii.every((radius, index) => index === 0 || radius >= radii[index - 1])).toBe(true);
  });
});
