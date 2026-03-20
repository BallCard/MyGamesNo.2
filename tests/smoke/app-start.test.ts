import { describe, expect, test, vi } from "vitest";

import { createApp } from "../../src/main";

describe("createApp", () => {
  test("renders a standalone home screen before entering gameplay", async () => {
    document.documentElement.className = "";
    document.body.className = "";
    document.body.innerHTML = `<div id="root"></div>`;
    const root = document.querySelector<HTMLElement>("#root");

    await createApp(root!, { startGame: false });

    expect(root?.textContent).toContain("ZJU Cat Merge");
    expect(root?.querySelector(".home-screen")).not.toBeNull();
    expect(root?.querySelector("#game-root")).toBeNull();
  });

  test("enters fullscreen game mode and locks scrolling when start is pressed", async () => {
    document.documentElement.className = "";
    document.body.className = "";
    document.body.innerHTML = `<div id="root"></div>`;
    const root = document.querySelector<HTMLElement>("#root");
    const createGameImpl = vi.fn();

    await createApp(root!, { startGame: false, createGameImpl });

    root?.querySelector<HTMLButtonElement>(".primary-button")?.click();
    await Promise.resolve();

    expect(createGameImpl).toHaveBeenCalledTimes(1);
    expect(root?.querySelector(".game-screen")).not.toBeNull();
    expect(root?.querySelector("#game-root")).not.toBeNull();
    expect(document.documentElement.classList.contains("app-locked")).toBe(true);
    expect(document.body.classList.contains("app-locked")).toBe(true);
  });
});
