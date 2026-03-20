import { describe, expect, test } from "vitest";

import { getMergeFeedbackStyle } from "../../src/game/systems/physicsPolicy";

describe("merge feedback policy", () => {
  test("uses a ring flash instead of scale pop", () => {
    expect(getMergeFeedbackStyle()).toBe("ring");
  });
});
