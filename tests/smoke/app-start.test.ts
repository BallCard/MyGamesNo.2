import { beforeEach, describe, expect, test, vi } from "vitest";

import { createApp } from "../../src/main";

function installStorageMock(): Map<string, string> {
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

  return store;
}

describe("createApp", () => {
  let storage: Map<string, string>;

  beforeEach(() => {
    storage = installStorageMock();
    document.documentElement.className = "";
    document.body.className = "";
  });

  test("shows a leaderboard preview on the home screen", async () => {
    document.body.innerHTML = `<div id="root"></div>`;
    const root = document.querySelector<HTMLElement>("#root");

    await createApp(root!, { startGame: false });

    const preview = root?.querySelector<HTMLElement>('[aria-label="leaderboard-preview"]');
    expect(preview).not.toBeNull();
    expect(preview?.textContent).toContain("总榜");
    expect(preview?.textContent).toContain("周榜");
  });

  test("renders a standalone home screen before entering gameplay", async () => {
    document.body.innerHTML = `<div id="root"></div>`;
    const root = document.querySelector<HTMLElement>("#root");

    await createApp(root!, { startGame: false });

    expect(root?.textContent).toContain("ZJU Cat Merge");
    expect(root?.querySelector(".home-screen")).not.toBeNull();
    expect(root?.querySelector("#game-root")).toBeNull();
  });

  test("enters fullscreen game mode and locks scrolling when start is pressed", async () => {
    document.body.innerHTML = `<div id="root"></div>`;
    const root = document.querySelector<HTMLElement>("#root");
    const createGameImpl = vi.fn();

    await createApp(root!, { startGame: false, createGameImpl });

    root?.querySelector<HTMLButtonElement>(".primary-button")?.click();
    await Promise.resolve();

    expect(createGameImpl).toHaveBeenCalledTimes(1);
    expect(root?.querySelector(".game-screen")).not.toBeNull();
    expect(root?.querySelector("#game-root")).not.toBeNull();
    expect(root?.querySelector("[aria-label=\"game-hud\"]")).not.toBeNull();
    expect(root?.textContent).toContain("ZJU MERGE");
    expect(document.documentElement.classList.contains("app-locked")).toBe(true);
    expect(document.body.classList.contains("app-locked")).toBe(true);
  });

  test("opens nickname modal and persists edits locally", async () => {
    document.body.innerHTML = `<div id="root"></div>`;
    const root = document.querySelector<HTMLElement>("#root");

    await createApp(root!, { startGame: false });

    root?.querySelector<HTMLButtonElement>('[aria-label="edit-nickname"]')?.click();

    const input = root?.querySelector<HTMLInputElement>('input[name="nickname"]');
    expect(input).not.toBeNull();

    input!.value = "耄耋王者";
    input!.dispatchEvent(new Event("input", { bubbles: true }));
    root?.querySelector<HTMLButtonElement>('[data-action="save-nickname"]')?.click();

    expect(root?.querySelector(".nick-value")?.textContent).toContain("耄耋王者");
    expect(storage.get("zju-cat-merge:nickname")).toBe("耄耋王者");
  });

  test("opens settings modal and persists toggles locally", async () => {
    document.body.innerHTML = `<div id="root"></div>`;
    const root = document.querySelector<HTMLElement>("#root");

    await createApp(root!, { startGame: false });

    root?.querySelectorAll<HTMLButtonElement>(".secondary-button")[1]?.click();

    const musicToggle = root?.querySelector<HTMLInputElement>('input[name="musicEnabled"]');
    expect(musicToggle).not.toBeNull();

    musicToggle!.checked = false;
    musicToggle!.dispatchEvent(new Event("change", { bubbles: true }));
    root?.querySelector<HTMLButtonElement>('[data-action="close-settings"]')?.click();

    expect(storage.get("zju-cat-merge:settings")).toContain('"musicEnabled":false');
  });

  test("opens leaderboard modal from home actions", async () => {
    document.body.innerHTML = `<div id="root"></div>`;
    const root = document.querySelector<HTMLElement>("#root");

    await createApp(root!, { startGame: false });

    root?.querySelectorAll<HTMLButtonElement>(".secondary-button")[0]?.click();

    const leaderboardModal = root?.querySelector<HTMLElement>('[aria-label="leaderboard-modal"]');
    expect(leaderboardModal).not.toBeNull();
    expect(leaderboardModal?.textContent).toContain("总榜");
    expect(leaderboardModal?.textContent).toContain("周榜");
  });
});

