import { describe, expect, test } from "vitest";

import { enqueueHudAction, shiftNextHudAction, type HudActionQueue } from "../../src/game/systems/hudActionQueue";

describe("hud action queue", () => {
  test("preserves action order", () => {
    let queue: HudActionQueue = [];
    queue = enqueueHudAction(queue, { kind: "restart" });
    queue = enqueueHudAction(queue, { kind: "tool", tool: "bomb" });

    const first = shiftNextHudAction(queue);
    expect(first.next).toEqual({ kind: "restart" });

    const second = shiftNextHudAction(first.queue);
    expect(second.next).toEqual({ kind: "tool", tool: "bomb" });
  });

  test("returns undefined when queue is empty", () => {
    const shifted = shiftNextHudAction([]);
    expect(shifted.next).toBeUndefined();
    expect(shifted.queue).toEqual([]);
  });
});
