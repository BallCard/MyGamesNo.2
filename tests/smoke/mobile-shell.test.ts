import { describe, expect, test } from "vitest";

import { createApp } from "../../src/main";

describe("mobile shell", () => {
  test("locks page scrolling for touch gameplay", async () => {
    document.documentElement.className = "";
    document.body.className = "";
    document.body.innerHTML = `<div id="root"></div>`;
    const root = document.querySelector<HTMLElement>("#root");

    await createApp(root!);

    expect(document.documentElement.classList.contains("app-locked")).toBe(true);
    expect(document.body.classList.contains("app-locked")).toBe(true);
  });
});
