import { beforeEach, describe, expect, test } from "vitest";

import {
  PLAYER_GUIDE_STATE_KEY,
  PLAYER_GUIDE_VERSION,
  buildPlayerGuideFlow,
  clearPlayerGuideState,
  markPlayerGuideCompleted,
  markPlayerGuideSkipped,
  readPlayerGuideState,
  shouldAutoOpenPlayerGuide,
} from "../../src/lib/playerGuide";

function installStorageMock(): void {
  const store = new Map<string, string>();
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
      clear: () => {
        store.clear();
      },
    },
  });
}

describe("player guide policy", () => {
  beforeEach(() => {
    installStorageMock();
    clearPlayerGuideState();
  });

  test("builds stable guide copy with combo cap interpolation", () => {
    const flow = buildPlayerGuideFlow(8);

    expect(flow.homeStep.title).toBe("先开一局");
    expect(flow.gameplaySteps).toHaveLength(5);
    expect(flow.gameplaySteps[2]?.body).toContain("最多 8 连");
    expect(flow.gameplaySteps[4]?.primaryLabel).toBe("知道了");
  });

  test("auto-opens when no state exists or version changes", () => {
    expect(shouldAutoOpenPlayerGuide()).toBe(true);

    markPlayerGuideCompleted();
    expect(shouldAutoOpenPlayerGuide()).toBe(false);
    expect(shouldAutoOpenPlayerGuide("future-version")).toBe(true);
  });

  test("stores skip and complete state with version", () => {
    markPlayerGuideSkipped();
    expect(readPlayerGuideState()).toEqual({
      version: PLAYER_GUIDE_VERSION,
      status: "skipped",
    });

    markPlayerGuideCompleted();
    expect(readPlayerGuideState()).toEqual({
      version: PLAYER_GUIDE_VERSION,
      status: "completed",
    });

    expect(window.localStorage.getItem(PLAYER_GUIDE_STATE_KEY)).toContain(PLAYER_GUIDE_VERSION);
  });
});
