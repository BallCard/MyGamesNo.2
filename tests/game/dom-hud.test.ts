import { afterEach, describe, expect, test, vi } from "vitest";

import { createHudBridge } from "../../src/game/hud/bridge";
import { mountGameHud } from "../../src/game/hud/domHud";
import { buildPlayerGuideFlow } from "../../src/lib/playerGuide";

function makeFrameAssets() {
  return {
    previewMode: "gif" as const,
    exportMode: "static" as const,
    previewGifSrc: "/assets/selected-gifs/cat-12.gif",
    previewFrameSrcs: ["/assets/cats/cat-12.png", "/assets/cats/cat-12-v2.png"],
    staticHeroSrc: "/assets/cats/cat-12.png",
    placeholderSrc: "placeholder",
  };
}

function makeStaticAssets() {
  return {
    previewMode: "static" as const,
    exportMode: "static" as const,
    previewGifSrc: "/assets/selected-gifs/cat-12.gif",
    previewFrameSrcs: ["/assets/cats/cat-11.png"],
    staticHeroSrc: "/assets/cats/cat-11.png",
    placeholderSrc: "placeholder",
  };
}

function flushMicrotasks(): Promise<void> {
  return Promise.resolve().then(() => Promise.resolve());
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

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

  test("waits for share preview preload and strips NEW BEST from the share path", async () => {
    document.body.innerHTML = '<div id="root"></div>';
    const root = document.getElementById("root") as HTMLElement;
    const bridge = createHudBridge();
    const exportSpy = vi.fn().mockResolvedValue("shared" as const);
    const resolveAssets = vi.fn(() => makeFrameAssets());
    let releasePreload: (() => void) | null = null;
    const preloadSpy = vi.fn(() => new Promise<void>((resolve) => {
      releasePreload = resolve;
    }));

    const unmount = mountGameHud(root, bridge, {
      resolveShareCardAssets: resolveAssets,
      preloadShareCardAssets: preloadSpy,
      exportShareCard: exportSpy,
    });
    bridge.publish({
      isGameOver: true,
      result: {
        score: 124500,
        peakLevel: 12,
        isNewBest: true,
      },
    });

    root.querySelector('[data-action="share-result"]')?.dispatchEvent(new Event("pointerdown", { bubbles: true, cancelable: true }));

    expect(resolveAssets).toHaveBeenCalledWith(12);
    expect(preloadSpy).toHaveBeenCalledWith(makeFrameAssets());
    expect(root.querySelector('[aria-label="share-preview"]')).toBeNull();

    releasePreload?.();
    await flushMicrotasks();

    const sharePreview = root.querySelector('[aria-label="share-preview"]') as HTMLElement;
    expect(sharePreview).not.toBeNull();
    expect(sharePreview.textContent).not.toContain("NEW BEST");
    expect(sharePreview.textContent).not.toContain("new best");
    expect(sharePreview.querySelector('.share-card-badge')).toBeNull();

    root.querySelector('[data-action="share-preview"]')?.dispatchEvent(new Event("pointerdown", { bubbles: true, cancelable: true }));

    expect(exportSpy).toHaveBeenCalledTimes(1);
    expect(exportSpy.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        fileName: "zju-cat-merge-share.png",
        renderInput: expect.objectContaining({
          score: 124500,
          peakLevel: 12,
          isNewBest: false,
          model: expect.objectContaining({
            band: "high",
            showNewBestBadge: false,
            shareLine: "Peak Lv.12 with a champion score.",
          }),
          assets: expect.objectContaining({
            previewMode: "gif",
            previewGifSrc: "/assets/selected-gifs/cat-12.gif",
            previewFrameSrcs: ["/assets/cats/cat-12.png", "/assets/cats/cat-12-v2.png"],
            staticHeroSrc: "/assets/cats/cat-12.png",
            placeholderSrc: "placeholder",
          }),
        }),
      }),
    );
    expect(exportSpy.mock.calls[0][0]).not.toHaveProperty("element");
    unmount();
  });

  test("renders gif-backed cat art when a real gif is available", async () => {
    document.body.innerHTML = '<div id="root"></div>';
    const root = document.getElementById("root") as HTMLElement;
    const bridge = createHudBridge();

    const unmount = mountGameHud(root, bridge, {
      resolveShareCardAssets: () => ({
        previewMode: "gif",
        exportMode: "static",
        previewGifSrc: "/assets/selected-gifs/cat-12.gif",
        previewFrameSrcs: ["/assets/cats/cat-12.png", "/assets/cats/cat-12-v2.png", "/assets/cats/cat-12-v3.png"],
        staticHeroSrc: "/assets/cats/cat-12.png",
        placeholderSrc: "placeholder",
      }),
      preloadShareCardAssets: () => Promise.resolve(),
    });
    bridge.publish({
      isGameOver: true,
      result: {
        score: 124500,
        peakLevel: 12,
        isNewBest: true,
      },
    });

    root.querySelector('[data-action="share-result"]')?.dispatchEvent(new Event("pointerdown", { bubbles: true, cancelable: true }));
    await flushMicrotasks();

    expect(root.querySelector('[aria-label="share-preview"]')).not.toBeNull();
    expect(root.querySelectorAll('.share-card-cat-gif')).toHaveLength(1);
    expect(root.querySelector('.share-card-cat-img')).toBeNull();
    expect(root.querySelector('.share-card-cat-placeholder')).toBeNull();
    expect(root.querySelector('.share-card-badge')).toBeNull();
    unmount();
  });

  test("renders a dedicated result mascot instead of reusing the base 1-12 chain art", () => {
    document.body.innerHTML = '<div id="root"></div>';
    const root = document.getElementById("root") as HTMLElement;
    const bridge = createHudBridge();

    const unmount = mountGameHud(root, bridge, {
      preloadShareCardAssets: () => Promise.resolve(),
    });
    bridge.publish({
      isGameOver: true,
      result: {
        score: 45890,
        peakLevel: 10,
        isNewBest: false,
      },
    });

    const mascot = root.querySelector('[aria-label="result-overlay"] .hud-result-mascot') as HTMLImageElement;
    expect(mascot).not.toBeNull();
    expect(mascot.getAttribute("src")).toBe("/assets/cats/cat-11-v2.png");
    unmount();
  });

  test("keeps the result overlay new-best state while the share preview suppresses it", async () => {
    document.body.innerHTML = '<div id="root"></div>';
    const root = document.getElementById("root") as HTMLElement;
    const bridge = createHudBridge();

    const unmount = mountGameHud(root, bridge, {
      preloadShareCardAssets: () => Promise.resolve(),
    });
    bridge.publish({
      isGameOver: true,
      result: {
        score: 82470,
        peakLevel: 10,
        isNewBest: true,
      },
    });

    expect(root.querySelector('[aria-label="result-overlay"] .hud-result-eyebrow')?.textContent).toBe("\u65b0\u7eaa\u5f55");

    root.querySelector('[data-action="share-result"]')?.dispatchEvent(new Event("pointerdown", { bubbles: true, cancelable: true }));
    await flushMicrotasks();

    expect(root.querySelector('[aria-label="share-preview"] .share-card-badge')).toBeNull();
    expect(root.querySelector('[aria-label="share-preview"]')?.textContent).not.toContain("NEW BEST");
    expect(root.querySelector('[aria-label="result-overlay"] .hud-result-eyebrow')?.textContent).toBe("\u65b0\u7eaa\u5f55");
    unmount();
  });

  test("hides the badge when the policy says not to show it", () => {
    document.body.innerHTML = '<div id="root"></div>';
    const root = document.getElementById("root") as HTMLElement;

    root.innerHTML = `
      <div class="share-preview" aria-label="share-preview" role="dialog" aria-modal="true">
        <div class="share-preview-shell">
          <div class="share-card is-band-mid is-pose-side is-anchor-beside is-preview-static" data-preview-mode="static" data-export-mode="static">
            <div class="share-card-stage">
              <div class="share-card-score-panel">
                <div class="share-card-score-label">SCORE</div>
                <div class="share-card-score">40000</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    expect(root.querySelector('.share-card-badge')).toBeNull();
  });

  test("blocks result-layer controls while the preview is open", async () => {
    document.body.innerHTML = '<div id="root"></div>';
    const root = document.getElementById("root") as HTMLElement;
    const bridge = createHudBridge();
    const restart = vi.fn();
    const tool = vi.fn();
    bridge.bindControls({ restartRound: restart, triggerTool: tool });

    const unmount = mountGameHud(root, bridge, {
      preloadShareCardAssets: () => Promise.resolve(),
    });
    bridge.publish({
      isGameOver: true,
      result: {
        score: 22670,
        peakLevel: 11,
        isNewBest: false,
      },
    });

    root.querySelector('[data-action="share-result"]')?.dispatchEvent(new Event("pointerdown", { bubbles: true, cancelable: true }));
    await flushMicrotasks();

    root.querySelector('[data-action="restart-result"]')?.dispatchEvent(new Event("pointerdown", { bubbles: true, cancelable: true }));
    root.querySelector('[data-action="share-result"]')?.dispatchEvent(new Event("pointerdown", { bubbles: true, cancelable: true }));

    expect(restart).not.toHaveBeenCalled();
    expect(tool).not.toHaveBeenCalled();
    expect(root.querySelectorAll('[aria-label="share-preview"]')).toHaveLength(1);
    expect(root.querySelector('[data-action="restart-result"]')?.getAttribute("tabindex")).toBe("-1");
    expect(root.querySelector('[data-action="share-result"]')?.getAttribute("tabindex")).toBe("-1");
    unmount();
  });

  test("renders gameplay guide steps and completes the flow", () => {
    document.body.innerHTML = '<div id="root"></div>';
    const root = document.getElementById("root") as HTMLElement;
    const bridge = createHudBridge();
    const onComplete = vi.fn();
    const onSkip = vi.fn();

    const unmount = mountGameHud(root, bridge, {
      playerGuideSteps: buildPlayerGuideFlow().gameplaySteps,
      onPlayerGuideComplete: onComplete,
      onPlayerGuideSkip: onSkip,
    });

    expect(root.querySelector('[aria-label="player-guide-gameplay"]')?.textContent).toContain("按住拖动");

    root.querySelector('[data-action="guide-next"]')?.dispatchEvent(new Event("pointerdown", { bubbles: true, cancelable: true }));
    expect(root.querySelector('[aria-label="player-guide-gameplay"]')?.textContent).toContain("同级会合成");

    root.querySelector('[data-action="guide-next"]')?.dispatchEvent(new Event("pointerdown", { bubbles: true, cancelable: true }));
    expect(root.querySelector('[aria-label="player-guide-gameplay"]')?.textContent).toContain("最多 8 连");

    root.querySelector('[data-action="guide-next"]')?.dispatchEvent(new Event("pointerdown", { bubbles: true, cancelable: true }));
    root.querySelector('[data-action="guide-next"]')?.dispatchEvent(new Event("pointerdown", { bubbles: true, cancelable: true }));
    root.querySelector('[data-action="guide-next"]')?.dispatchEvent(new Event("pointerdown", { bubbles: true, cancelable: true }));

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onSkip).not.toHaveBeenCalled();
    expect(root.querySelector('[aria-label="player-guide-gameplay"]')).toBeNull();
    unmount();
  });

  test("renders a leaderboard link from the result layer", () => {
    document.body.innerHTML = '<div id="root"></div>';
    const root = document.getElementById("root") as HTMLElement;
    const bridge = createHudBridge();

    const unmount = mountGameHud(root, bridge, {
      leaderboardHref: "/?openLeaderboard=1",
      preloadShareCardAssets: () => Promise.resolve(),
    });
    bridge.publish({
      isGameOver: true,
      result: {
        score: 54020,
        peakLevel: 9,
        isNewBest: false,
      },
    });

    const link = root.querySelector('.hud-result-link') as HTMLAnchorElement;
    expect(link).not.toBeNull();
    expect(link.getAttribute("href")).toBe('/?openLeaderboard=1');
    expect(link.textContent).toContain('\u67e5\u770b\u6392\u884c\u699c');
    unmount();
  });


  test("navigates to the leaderboard from the result layer on pointerdown", () => {
    document.body.innerHTML = '<div id="root"></div>';
    const root = document.getElementById("root") as HTMLElement;
    const bridge = createHudBridge();
    const assignSpy = vi.fn();
    const originalLocation = window.location;

    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        ...originalLocation,
        assign: assignSpy,
      },
    });

    const unmount = mountGameHud(root, bridge, {
      leaderboardHref: "/?openLeaderboard=1",
      preloadShareCardAssets: () => Promise.resolve(),
    });
    bridge.publish({
      isGameOver: true,
      result: {
        score: 54020,
        peakLevel: 9,
        isNewBest: false,
      },
    });

    root.querySelector('.hud-result-link')?.dispatchEvent(new Event("pointerdown", { bubbles: true, cancelable: true }));

    expect(assignSpy).toHaveBeenCalledWith("http://localhost:3000/?openLeaderboard=1");
    unmount();
  });

  test("closes the preview and leaves the result layer intact", async () => {
    document.body.innerHTML = '<div id="root"></div>';
    const root = document.getElementById("root") as HTMLElement;
    const bridge = createHudBridge();

    const unmount = mountGameHud(root, bridge, {
      preloadShareCardAssets: () => Promise.resolve(),
    });
    bridge.publish({
      isGameOver: true,
      result: {
        score: 82470,
        peakLevel: 10,
        isNewBest: true,
      },
    });

    root.querySelector('[data-action="share-result"]')?.dispatchEvent(new Event("pointerdown", { bubbles: true, cancelable: true }));
    await flushMicrotasks();
    root.querySelector('[data-action="close-share-preview"]')?.dispatchEvent(new Event("pointerdown", { bubbles: true, cancelable: true }));

    expect(root.querySelector('[aria-label="share-preview"]')).toBeNull();
    expect(root.querySelector('[aria-label="result-overlay"]')).not.toBeNull();
    expect(root.querySelector('[data-action="restart-result"]')?.getAttribute("tabindex")).toBe(null);
    expect(root.querySelector('[data-action="share-result"]')?.getAttribute("tabindex")).toBe(null);
    unmount();
  });
});






