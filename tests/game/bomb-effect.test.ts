import { describe, expect, test } from "vitest";

import { classifyBombImpact } from "../../src/game/systems/bombEffect";

describe("bomb effect", () => {
  test("deletes a wider inner ring and keeps a visible outer knockback zone", () => {
    expect(classifyBombImpact(0)).toBe("delete");
    expect(classifyBombImpact(58)).toBe("delete");
    expect(classifyBombImpact(96)).toBe("knockback");
    expect(classifyBombImpact(154)).toBe("knockback");
    expect(classifyBombImpact(176)).toBe("none");
  });
});
