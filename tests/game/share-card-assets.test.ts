import { describe, expect, test } from "vitest";

import { resolveShareCardAssets } from "../../src/game/share/shareCardAssets";

describe("share card assets", () => {
  test("prefers preview gifs while keeping public PNGs for export", () => {
    const cat5 = resolveShareCardAssets(5);
    const cat12 = resolveShareCardAssets(12);

    expect(cat5.previewMode).toBe("gif");
    expect(cat5.exportMode).toBe("static");
    expect(cat5.previewGifSrc).toContain("selected-gifs/cat-5.gif");
    expect(cat5.previewFrameSrcs).toHaveLength(8);
    expect(cat5.previewFrameSrcs[0]).toContain("share-preview-frames/cat-5/frame-01.png");
    expect(cat5.previewFrameSrcs[7]).toContain("share-preview-frames/cat-5/frame-08.png");
    expect(cat5.staticHeroSrc).toBe("/assets/cats/cat-5.png");

    expect(cat12.previewMode).toBe("gif");
    expect(cat12.exportMode).toBe("static");
    expect(cat12.previewGifSrc).toContain("selected-gifs/cat-12.gif");
    expect(cat12.previewFrameSrcs).toHaveLength(8);
    expect(cat12.previewFrameSrcs[0]).toContain("share-preview-frames/cat-12/frame-01.png");
    expect(cat12.previewFrameSrcs[7]).toContain("share-preview-frames/cat-12/frame-08.png");
    expect(cat12.staticHeroSrc).toBe("/assets/cats/cat-12.png");
  });

  test("uses static preview when only the public hero exists and falls back to placeholder when nothing does", () => {
    const cat1 = resolveShareCardAssets(1, {
      previewGifSrcByKey: {},
      previewFrameSrcsByKey: {},
      staticHeroSrcByKey: { "cat-1": "/assets/cats/cat-1.png" },
      placeholderSrc: "placeholder",
    });
    const placeholder = resolveShareCardAssets(5, {
      previewGifSrcByKey: {},
      previewFrameSrcsByKey: {},
      staticHeroSrcByKey: {},
      placeholderSrc: "placeholder",
    });

    expect(cat1.previewMode).toBe("static");
    expect(cat1.exportMode).toBe("static");
    expect(cat1.previewFrameSrcs).toEqual(["/assets/cats/cat-1.png"]);
    expect(cat1.staticHeroSrc).toBe("/assets/cats/cat-1.png");

    expect(placeholder.previewMode).toBe("placeholder");
    expect(placeholder.exportMode).toBe("placeholder");
    expect(placeholder.previewFrameSrcs).toEqual([]);
    expect(placeholder.staticHeroSrc).toBeUndefined();
  });
});
