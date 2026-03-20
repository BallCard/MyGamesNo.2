import { describe, expect, test } from "vitest";

import { getGameUiLayout, getPreviewSpawnY } from "../../src/game/systems/uiPolicy";

describe("game ui layout", () => {
  test("uses a dark single-piece header and a separate score display", () => {
    const layout = getGameUiLayout(444, 800);

    expect(layout.header.backgroundColor).toBe(0x060816);
    expect(layout.header.height).toBeGreaterThanOrEqual(92);
    expect(layout.scoreDisplay.valueY).toBeGreaterThan(layout.header.height);
    expect(layout.scoreDisplay.subtitle).toBe("ZJU MERGE");
  });

  test("makes the playfield span edge-to-edge without a framed inset card", () => {
    const layout = getGameUiLayout(444, 800);

    expect(layout.playfield.left).toBe(0);
    expect(layout.playfield.right).toBe(444);
    expect(layout.playfield.hasFrame).toBe(false);
  });

  test("integrates restart into the next cluster instead of a separate row", () => {
    const layout = getGameUiLayout(444, 800);

    expect(layout.header.restart.integratedWithNext).toBe(true);
    expect(layout.header.restart.hasOwnContainer).toBe(false);
  });

  test("uses floating tool chips instead of bordered square buttons", () => {
    const layout = getGameUiLayout(444, 800);

    expect(layout.tools.hasBorder).toBe(false);
    expect(layout.tools.hasShadow).toBe(true);
    expect(layout.tools.labelBelowIcon).toBe(true);
  });

  test("places the queued ball preview between the header edge and the red line", () => {
    const playfieldTop = 102;
    const redLineY = 246;
    const previewSpawnY = getPreviewSpawnY(playfieldTop, redLineY);

    expect(previewSpawnY).toBeGreaterThan(playfieldTop + 32);
    expect(previewSpawnY).toBeLessThan(redLineY - 24);
  });
});
