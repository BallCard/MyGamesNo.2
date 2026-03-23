import { describe, expect, test } from "vitest";

import { buildShareCardModel } from "../../src/game/share/shareCardPolicy";

describe("share card policy", () => {
  test("classifies score bands at the 100k split", () => {
    expect(buildShareCardModel({ score: 39999, peakLevel: 9, isNewBest: false }).band).toBe("low");
    expect(buildShareCardModel({ score: 40000, peakLevel: 9, isNewBest: false }).band).toBe("low");
    expect(buildShareCardModel({ score: 99999, peakLevel: 10, isNewBest: false }).band).toBe("low");
    expect(buildShareCardModel({ score: 100000, peakLevel: 10, isNewBest: true }).band).toBe("high");
  });

  test("locks the low and high composition intent", () => {
    const low = buildShareCardModel({ score: 68000, peakLevel: 8, isNewBest: false });
    const high = buildShareCardModel({ score: 100000, peakLevel: 10, isNewBest: true });

    expect(low.poseMode).toBe("step");
    expect(low.scoreAnchor).toBe("under");
    expect(low.shareLine).toBe("Peak Lv.8 from a steady merge streak.");
    expect(low.showNewBestBadge).toBe(false);

    expect(high.poseMode).toBe("lift");
    expect(high.scoreAnchor).toBe("over");
    expect(high.showNewBestBadge).toBe(false);
    expect(high.shareLine).toBe("Peak Lv.10 with a champion score.");
  });
});
