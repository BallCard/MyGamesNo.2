import { beforeEach, describe, expect, test, vi } from "vitest";

import { createApp } from "../../src/main";
import type { LeaderboardClient } from "../../src/lib/leaderboardApi";
import { PLAYER_GUIDE_STATE_KEY } from "../../src/lib/playerGuide";

function flushMicrotasks(): Promise<void> {
  return Promise.resolve().then(() => Promise.resolve());
}

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

function createLeaderboardClientStub(): LeaderboardClient {
  return {
    initPlayer: vi.fn().mockResolvedValue({ anonymousId: "anon-1", nickname: "\u533f\u540d\u540c\u5b66" }),
    updateNickname: vi.fn().mockResolvedValue({ anonymousId: "anon-1", nickname: "\u8004\u800b\u738b\u8005" }),
    submitBestScoreIfNeeded: vi.fn().mockResolvedValue(false),
    fetchGlobalLeaderboard: vi.fn().mockResolvedValue({
      entries: [
        {
          rank: 1,
          anonymousId: "anon-2",
          nickname: "\u53ef\u4e91\u5927\u4f6c",
          score: 88888,
          peakLevel: 9,
          isSelf: false,
        },
      ],
      me: {
        anonymousId: "anon-1",
        nickname: "\u533f\u540d\u540c\u5b66",
        score: 52000,
        peakLevel: 8,
        rank: 12,
      },
    }),
  };
}

describe("createApp", () => {
  let storage: Map<string, string>;

  beforeEach(() => {
    storage = installStorageMock();
    document.documentElement.className = "";
    document.body.className = "";
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    window.history.pushState({}, "", "/");
    Object.defineProperty(window, "scrollTo", {
      configurable: true,
      value: vi.fn(),
    });
  });

  test("auto-opens the home guide on first visit and lets the player enter gameplay guide", async () => {
    document.body.innerHTML = `<div id="root"></div>`;
    const root = document.querySelector<HTMLElement>("#root");
    const createGameImpl = vi.fn();

    await createApp(root!, { startGame: false, createGameImpl, leaderboardClient: createLeaderboardClientStub() });

    expect(root?.querySelector('[aria-label="player-guide-home"]')).not.toBeNull();
    expect(root?.textContent).toContain("先开一局");

    root?.querySelector<HTMLElement>('[data-action="start-guide"]')?.click();
    await flushMicrotasks();

    expect(createGameImpl).toHaveBeenCalledTimes(1);
    expect(root?.querySelector('[aria-label="player-guide-gameplay"]')?.textContent).toContain("按住拖动");
  });

  test("skip suppresses future auto-open but manual guide reopen still works", async () => {
    document.body.innerHTML = `<div id="root"></div>`;
    const root = document.querySelector<HTMLElement>("#root");

    await createApp(root!, { startGame: false, leaderboardClient: createLeaderboardClientStub() });

    root?.querySelector<HTMLElement>('[data-action="skip-guide"]')?.click();
    expect(storage.get(PLAYER_GUIDE_STATE_KEY)).toContain("skipped");
    expect(root?.querySelector('[aria-label="player-guide-home"]')).toBeNull();

    document.body.innerHTML = `<div id="root-2"></div>`;
    const root2 = document.querySelector<HTMLElement>("#root-2");
    await createApp(root2!, { startGame: false, leaderboardClient: createLeaderboardClientStub() });

    expect(root2?.querySelector('[aria-label="player-guide-home"]')).toBeNull();

    root2?.querySelector<HTMLElement>('[data-action="open-guide"]')?.click();
    expect(root2?.querySelector('[aria-label="player-guide-home"]')).not.toBeNull();
  });

  test("shows a real leaderboard preview on the home screen", async () => {
    document.body.innerHTML = `<div id="root"></div>`;
    const root = document.querySelector<HTMLElement>("#root");

    await createApp(root!, { startGame: false, leaderboardClient: createLeaderboardClientStub() });

    const preview = root?.querySelector<HTMLElement>('[aria-label="leaderboard-preview"]');
    expect(preview).not.toBeNull();
    expect(preview?.textContent).toContain("\u5b9e\u65f6\u6392\u884c\u699c");
    expect(preview?.textContent).toContain("\u603b\u699c");
    expect(preview?.textContent).toContain("\u5468\u699c");
    expect(preview?.textContent).toContain("\u6211\u7684\u6700\u4f73");
    expect(preview?.textContent).toContain("\u67e5\u770b\u5b8c\u6574\u699c\u5355");
  });

  test("renders a standalone home screen before entering gameplay", async () => {
    document.body.innerHTML = `<div id="root"></div>`;
    const root = document.querySelector<HTMLElement>("#root");

    await createApp(root!, { startGame: false, leaderboardClient: createLeaderboardClientStub() });

    expect(root?.textContent).toContain("ZJU Cat Merge");
    expect(root?.querySelector(".home-screen")).not.toBeNull();
    expect(root?.querySelector("#game-root")).toBeNull();
  });

  test("enters fullscreen game mode and resets scroll before creating the game", async () => {
    document.body.innerHTML = `<div id="root"></div>`;
    const root = document.querySelector<HTMLElement>("#root");
    const createGameImpl = vi.fn();
    document.body.scrollTop = 240;
    document.documentElement.scrollTop = 240;

    await createApp(root!, { startGame: false, createGameImpl, leaderboardClient: createLeaderboardClientStub() });

    root?.querySelector<HTMLButtonElement>(".primary-button")?.click();
    await Promise.resolve();

    expect(createGameImpl).toHaveBeenCalledTimes(1);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "auto" });
    expect(document.body.scrollTop).toBe(0);
    expect(document.documentElement.scrollTop).toBe(0);
    expect(root?.querySelector(".game-screen")).not.toBeNull();
    expect(root?.querySelector("#game-root")).not.toBeNull();
    expect(root?.querySelector('[aria-label="game-hud"]')).not.toBeNull();
    expect(root?.textContent).toContain("ZJU MERGE");
    expect(document.documentElement.classList.contains("app-locked")).toBe(true);
    expect(document.body.classList.contains("app-locked")).toBe(true);
  });

  test("opens nickname modal and persists edits locally", async () => {
    document.body.innerHTML = `<div id="root"></div>`;
    const root = document.querySelector<HTMLElement>("#root");
    const leaderboardClient = createLeaderboardClientStub();

    await createApp(root!, { startGame: false, leaderboardClient });

    root?.querySelector<HTMLButtonElement>('[aria-label="edit-nickname"]')?.click();

    const input = root?.querySelector<HTMLInputElement>('input[name="nickname"]');
    expect(input).not.toBeNull();

    input!.value = "\u8004\u800b\u738b\u8005";
    input!.dispatchEvent(new Event("input", { bubbles: true }));
    root?.querySelector<HTMLButtonElement>('[data-action="save-nickname"]')?.click();
    await Promise.resolve();

    expect(root?.querySelector(".nick-value")?.textContent).toContain("\u8004\u800b\u738b\u8005");
    expect(storage.get("zju-cat-merge:nickname")).toBe("\u8004\u800b\u738b\u8005");
    expect(leaderboardClient.updateNickname).toHaveBeenCalledWith("\u8004\u800b\u738b\u8005");
  });

  test("opens settings modal and persists toggles locally", async () => {
    document.body.innerHTML = `<div id="root"></div>`;
    const root = document.querySelector<HTMLElement>("#root");

    await createApp(root!, { startGame: false, leaderboardClient: createLeaderboardClientStub() });

    root?.querySelector<HTMLButtonElement>('[data-action="open-settings"]')?.click();

    const musicToggle = root?.querySelector<HTMLInputElement>('input[name="musicEnabled"]');
    expect(musicToggle).not.toBeNull();

    musicToggle!.checked = false;
    musicToggle!.dispatchEvent(new Event("change", { bubbles: true }));
    root?.querySelector<HTMLButtonElement>('[data-action="close-settings"]')?.click();

    expect(storage.get("zju-cat-merge:settings")).toContain('"musicEnabled":false');
  });

  test("renders the share lab when the query flag is present", async () => {
    window.history.pushState({}, "", "/?shareLab=1");
    document.body.innerHTML = `<div id="root"></div>`;
    const root = document.querySelector<HTMLElement>("#root");

    await createApp(root!, { startGame: false, leaderboardClient: createLeaderboardClientStub() });

    expect(root?.querySelector(".share-lab-screen")).not.toBeNull();
    expect(root?.querySelector('[aria-label="share-lab-bands"]')).not.toBeNull();
    expect(root?.querySelector('[aria-label="share-lab-cats"]')).not.toBeNull();
    expect(root?.textContent).toContain("Share Card Lab");
    window.history.pushState({}, "", "/");
  });

  test("opens leaderboard modal from home actions", async () => {
    document.body.innerHTML = `<div id="root"></div>`;
    const root = document.querySelector<HTMLElement>("#root");

    await createApp(root!, { startGame: false, leaderboardClient: createLeaderboardClientStub() });

    root?.querySelector<HTMLButtonElement>('[data-action="open-leaderboard"]')?.click();

    const leaderboardModal = root?.querySelector<HTMLElement>('[aria-label="leaderboard-modal"]');
    expect(leaderboardModal).not.toBeNull();
    expect(leaderboardModal?.textContent).toContain("\u6392\u884c\u699c");
    expect(leaderboardModal?.textContent).toContain("\u603b\u699c");
    expect(leaderboardModal?.textContent).toContain("\u5468\u699c");
    expect(leaderboardModal?.textContent).toContain("\u6211\u7684\u6700\u4f73");
  });

  test("opens leaderboard modal on query flag", async () => {
    window.history.pushState({}, "", "/?openLeaderboard=1");
    document.body.innerHTML = `<div id="root"></div>`;
    const root = document.querySelector<HTMLElement>("#root");

    await createApp(root!, { startGame: false, leaderboardClient: createLeaderboardClientStub() });

    expect(root?.querySelector('[aria-label="leaderboard-modal"]')).not.toBeNull();
  });
});

