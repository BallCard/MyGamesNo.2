import { describe, expect, test } from "vitest";

import { shouldAnimatePhysicsBodyOnMerge } from "../../src/game/systems/physicsPolicy";

describe("merge animation policy", () => {
  test("never scales the Matter body during merge feedback", () => {
    expect(shouldAnimatePhysicsBodyOnMerge()).toBe(false);
  });
});
