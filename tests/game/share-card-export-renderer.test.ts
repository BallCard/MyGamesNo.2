import { afterEach, describe, expect, test, vi } from "vitest";

import { resolveShareCardAssets } from "../../src/game/share/shareCardAssets";
import { buildShareCardModel } from "../../src/game/share/shareCardPolicy";
import { renderShareCardToCanvas } from "../../src/game/share/shareCardExportRenderer";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function createContextSpy() {
  const gradient = { addColorStop: vi.fn() };
  return {
    beginPath: vi.fn(),
    closePath: vi.fn(),
    clip: vi.fn(),
    createLinearGradient: vi.fn().mockReturnValue(gradient),
    drawImage: vi.fn(),
    fill: vi.fn(),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    lineTo: vi.fn(),
    moveTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    restore: vi.fn(),
    save: vi.fn(),
    arc: vi.fn(),
    set fillStyle(_value: string | CanvasGradient | CanvasPattern) {},
    set font(_value: string) {},
    set textAlign(_value: CanvasTextAlign) {},
  } as unknown as CanvasRenderingContext2D;
}

describe("share card export renderer", () => {
  test("renders a fixed 1080 x 1920 canvas with safe area metadata", async () => {
    const context = createContextSpy();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context);

    const result = await renderShareCardToCanvas({
      model: buildShareCardModel({ score: 82470, peakLevel: 10, isNewBest: true }),
      score: 82470,
      peakLevel: 10,
      isNewBest: true,
      assets: resolveShareCardAssets(10, {
        previewFrameSrcsByKey: {},
        staticHeroSrcByKey: {},
        placeholderSrc: "placeholder",
      }),
    });

    expect(result.width).toBe(1080);
    expect(result.height).toBe(1920);
    expect(result.safeArea.left).toBe(96);
    expect(result.safeArea.top).toBe(120);
    expect(result.safeArea.right).toBe(96);
    expect(result.safeArea.bottom).toBe(120);
    expect(result.assetMode).toBe("placeholder");
    expect(result.heroSource).toBeNull();
    expect(context.drawImage).not.toHaveBeenCalled();
  });

  test("uses static hero art when the source loads and falls back when it does not", async () => {
    const context = createContextSpy();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context);

    class MockImage {
      onload: null | (() => void) = null;
      onerror: null | (() => void) = null;
      set src(_value: string) {
        queueMicrotask(() => {
          this.onload?.();
        });
      }
    }

    vi.stubGlobal("Image", MockImage as unknown as typeof Image);

    const result = await renderShareCardToCanvas({
      model: buildShareCardModel({ score: 124500, peakLevel: 12, isNewBest: true }),
      score: 124500,
      peakLevel: 12,
      isNewBest: true,
      assets: resolveShareCardAssets(12),
    });

    expect(result.assetMode).toBe("static");
    expect(result.heroSource).toContain("/assets/cats/cat-12.png");
    expect(context.drawImage).toHaveBeenCalledTimes(1);
  });
});
