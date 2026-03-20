import { describe, expect, test, vi } from "vitest";

import { createApp } from "../../src/main";

describe("mobile shell", () => {
  test("keeps home screen scrollable and only locks after entering gameplay", async () => {
    document.documentElement.className = "";
    document.body.className = "";
    document.body.innerHTML = `<div id="root"></div>`;
    const root = document.querySelector<HTMLElement>("#root");
    const createGameImpl = vi.fn();

    await createApp(root!, { startGame: false, createGameImpl });

    expect(document.documentElement.classList.contains("app-locked")).toBe(false);
    expect(document.body.classList.contains("app-locked")).toBe(false);

    root?.querySelector<HTMLButtonElement>(".primary-button")?.click();
    await Promise.resolve();

    expect(createGameImpl).toHaveBeenCalledTimes(1);
    expect(document.documentElement.classList.contains("app-locked")).toBe(true);
    expect(document.body.classList.contains("app-locked")).toBe(true);
  });
});
