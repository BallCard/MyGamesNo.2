import { describe, expect, test } from "vitest";

import {
  CAT_DEFINITIONS,
  getCatDefinition,
  getNextCatLevel,
  getScoreForMerge,
} from "../../src/game/config/cats";
import { mergeCatLevels } from "../../src/game/systems/mergeSystem";

describe("mergeCatLevels", () => {
  test("merges two same-level cats into the next level with score", () => {
    const result = mergeCatLevels(3, 3);

    expect(result.merged).toBe(true);
    expect(result.resultLevel).toBe(4);
    expect(result.scoreGained).toBe(getScoreForMerge(4));
  });

  test("allows the last meaningful merge from level 17 into level 18", () => {
    const result = mergeCatLevels(17, 17);

    expect(result.merged).toBe(true);
    expect(result.resultLevel).toBe(18);
    expect(result.scoreGained).toBe(getScoreForMerge(18));
  });

  test("does not merge cats with different levels", () => {
    const result = mergeCatLevels(3, 4);

    expect(result.merged).toBe(false);
    expect(result.resultLevel).toBeNull();
    expect(result.scoreGained).toBe(0);
  });

  test("does not merge beyond the highest configured level", () => {
    const maxLevel = CAT_DEFINITIONS[CAT_DEFINITIONS.length - 1].level;
    const result = mergeCatLevels(maxLevel, maxLevel);

    expect(result.merged).toBe(false);
    expect(result.resultLevel).toBeNull();
    expect(result.scoreGained).toBe(0);
    expect(getNextCatLevel(maxLevel)).toBeNull();
  });
});

describe("cat configuration", () => {
  test("returns a config entry for each level from 1 through 18", () => {
    expect(CAT_DEFINITIONS).toHaveLength(18);
    expect(getCatDefinition(1)?.assetKey).toBe("cat-1");
    expect(getCatDefinition(13)?.assetKey).toBe("cat-8-v2");
    expect(getCatDefinition(16)?.assetKey).toBe("cat-11-v2");
    expect(getCatDefinition(18)?.assetKey).toBe("cat-12-v3");
  });
});
