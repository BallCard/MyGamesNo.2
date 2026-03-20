import { describe, expect, test } from "vitest";

import { getMergeSpawnPolicy, MATTER_ENABLE_SLEEP } from "../../src/game/systems/physicsPolicy";

describe("physics policy", () => {
  test("disables matter sleeping so balls cannot freeze mid-air", () => {
    expect(MATTER_ENABLE_SLEEP).toBe(false);
  });

  test("merged balls recover without a static settle path", () => {
    expect(getMergeSpawnPolicy()).toMatchObject({
      useStaticSettle: false,
      impulseY: expect.any(Number)
    });
  });
});
