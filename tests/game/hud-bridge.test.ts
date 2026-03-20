import { describe, expect, test, vi } from "vitest";

import { createHudBridge } from "../../src/game/hud/bridge";

describe("hud bridge", () => {
  test("publishes hud state updates to subscribers", () => {
    const bridge = createHudBridge();
    const listener = vi.fn();
    const unsubscribe = bridge.subscribe(listener);

    bridge.publish({ score: 230, scoreLabel: "ZJU MERGE" });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].score).toBe(230);
    unsubscribe();
  });

  test("forwards restart and tool commands to the bound scene controls", () => {
    const bridge = createHudBridge();
    const restart = vi.fn();
    const tool = vi.fn();

    bridge.bindControls({ restartRound: restart, triggerTool: tool });
    bridge.restart();
    bridge.useTool("bomb");

    expect(restart).toHaveBeenCalledTimes(1);
    expect(tool).toHaveBeenCalledWith("bomb");
  });
});
