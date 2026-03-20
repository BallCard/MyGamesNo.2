import { describe, expect, test, vi } from "vitest";

import { createHudBridge } from "../../src/game/hud/bridge";
import { mountGameHud } from "../../src/game/hud/domHud";

describe("dom hud", () => {
  test("fires restart immediately on pointerdown", () => {
    document.body.innerHTML = '<div id="root"></div>';
    const root = document.getElementById("root") as HTMLElement;
    const bridge = createHudBridge();
    const restart = vi.fn();
    const tool = vi.fn();
    bridge.bindControls({ restartRound: restart, triggerTool: tool });

    const unmount = mountGameHud(root, bridge);
    const button = root.querySelector('[data-action="restart"]') as HTMLElement;

    button.dispatchEvent(new Event("pointerdown", { bubbles: true, cancelable: true }));

    expect(restart).toHaveBeenCalledTimes(1);
    unmount();
  });

  test("fires tool actions immediately on pointerdown", () => {
    document.body.innerHTML = '<div id="root"></div>';
    const root = document.getElementById("root") as HTMLElement;
    const bridge = createHudBridge();
    const restart = vi.fn();
    const tool = vi.fn();
    bridge.bindControls({ restartRound: restart, triggerTool: tool });

    const unmount = mountGameHud(root, bridge);
    const button = root.querySelector('[data-tool="bomb"]') as HTMLElement;

    button.dispatchEvent(new Event("pointerdown", { bubbles: true, cancelable: true }));

    expect(tool).toHaveBeenCalledWith("bomb");
    expect(restart).not.toHaveBeenCalled();
    unmount();
  });
});
