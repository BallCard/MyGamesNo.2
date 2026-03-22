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

  test("renders result overlay and hides tool buttons when result data is published", () => {
    document.body.innerHTML = '<div id="root"></div>';
    const root = document.getElementById("root") as HTMLElement;
    const bridge = createHudBridge();

    const unmount = mountGameHud(root, bridge);
    bridge.publish({
      isGameOver: true,
      result: {
        score: 22670,
        peakLevel: 11,
        isNewBest: false,
      },
    });

    expect(root.querySelector('[aria-label="result-overlay"]')).not.toBeNull();
    expect(root.querySelector('[data-tool="bomb"]')).toBeNull();
    expect(root.textContent).toContain("RUN COMPLETE");
    expect(root.textContent).toContain("22670");
    unmount();
  });
});
