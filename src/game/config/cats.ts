export type CatDefinition = {
  level: number;
  assetKey: string;
  scoreValue: number;
};

export type QueuedCat = {
  level: number;
  assetKey: string;
};

export type UnlockProgress = {
  currentMaxLevel: number;
  currentMinScore: number;
  nextMaxLevel: number | null;
  nextMinScore: number | null;
  progressRatio: number;
};

import { SCORE_UNLOCKS } from "../systems/gameplayTuning";

const MAX_DROP_LEVEL = 8;
const MAX_CAT_LEVEL = 18;
const BASE_PLAYFIELD_WIDTH = 444;
const BASE_PLAYFIELD_HEIGHT = 574;
const MIN_CAT_RADIUS = 20;
const MAX_CAT_RADIUS_WIDTH_RATIO = 0.218;
const MAX_CAT_RADIUS_HEIGHT_RATIO = 0.168;
const BASE_MAX_CAT_RADIUS = 96;
const BASE_RADIUS_BY_LEVEL = [
  20,
  24,
  28,
  33,
  38,
  44,
  50,
  56,
  61,
  66,
  71,
  76,
  81,
  85,
  88,
  91,
  94,
  96,
] as const;

const LEVEL_ASSET_KEYS = [
  "cat-1",
  "cat-2",
  "cat-3",
  "cat-4",
  "cat-5",
  "cat-6",
  "cat-7",
  "cat-8",
  "cat-9",
  "cat-10",
  "cat-11",
  "cat-12",
  "cat-8-v2",
  "cat-9-v2",
  "cat-10-v2",
  "cat-11-v2",
  "cat-12-v2",
  "cat-12-v3"
] as const;

export const RESULT_MASCOT_ASSET_KEY = "cat-11-v2";

export const CAT_DEFINITIONS: CatDefinition[] = Array.from(
  { length: MAX_CAT_LEVEL },
  (_, index) => {
    const level = index + 1;

    return {
      level,
      assetKey: LEVEL_ASSET_KEYS[index] ?? "cat-12-v3",
      scoreValue: level * 10,
    };
  },
);

const DROP_VARIANTS: Record<number, string[]> = {
  1: ["cat-1"],
  2: ["cat-2"],
  3: ["cat-3"],
  4: ["cat-4"],
  5: ["cat-5"],
  6: ["cat-6"],
  7: ["cat-7"],
  8: ["cat-8", "cat-8-v2"],
  9: ["cat-9", "cat-9-v2"],
  10: ["cat-10", "cat-10-v2"],
  11: ["cat-11", "cat-11-v2"],
  12: ["cat-12", "cat-12-v2", "cat-12-v3"],
};

export const ALL_CAT_ASSET_KEYS = Array.from(
  new Set([...CAT_DEFINITIONS.map((cat) => cat.assetKey), ...Object.values(DROP_VARIANTS).flat(), RESULT_MASCOT_ASSET_KEY]),
);

export function getCatDefinition(level: number): CatDefinition | null {
  return CAT_DEFINITIONS.find((cat) => cat.level === level) ?? null;
}

export function getCatRadius(
  level: number,
  playfieldWidth: number = BASE_PLAYFIELD_WIDTH,
  playfieldHeight: number = BASE_PLAYFIELD_HEIGHT,
): number {
  const clampedLevel = Math.max(1, Math.min(MAX_CAT_LEVEL, level));
  const maxRadius = Math.floor(
    Math.min(playfieldWidth * MAX_CAT_RADIUS_WIDTH_RATIO, playfieldHeight * MAX_CAT_RADIUS_HEIGHT_RATIO),
  );
  const baseRadius = BASE_RADIUS_BY_LEVEL[clampedLevel - 1] ?? BASE_MAX_CAT_RADIUS;
  const normalizedRadius = (baseRadius - MIN_CAT_RADIUS) / (BASE_MAX_CAT_RADIUS - MIN_CAT_RADIUS);

  return Math.round(MIN_CAT_RADIUS + (maxRadius - MIN_CAT_RADIUS) * normalizedRadius);
}

export function getNextCatLevel(level: number): number | null {
  const next = getCatDefinition(level + 1);
  return next?.level ?? null;
}

export function getScoreForMerge(level: number): number {
  return getCatDefinition(level)?.scoreValue ?? 0;
}

export function getUnlockedMaxDropLevel(score: number): number {
  let maxLevel = 1;
  for (const unlock of SCORE_UNLOCKS) {
    if (score >= unlock.minScore) {
      maxLevel = unlock.maxLevel;
    }
  }
  return Math.min(maxLevel, MAX_DROP_LEVEL);
}

export function getUnlockProgress(score: number): UnlockProgress {
  let currentIndex = 0;
  for (let index = 0; index < SCORE_UNLOCKS.length; index += 1) {
    if (score >= SCORE_UNLOCKS[index].minScore) {
      currentIndex = index;
    }
  }

  const current = SCORE_UNLOCKS[currentIndex];
  const next = SCORE_UNLOCKS[currentIndex + 1] ?? null;
  const progressRatio = next
    ? Math.min(1, Math.max(0, (score - current.minScore) / (next.minScore - current.minScore)))
    : 1;

  return {
    currentMaxLevel: current.maxLevel,
    currentMinScore: current.minScore,
    nextMaxLevel: next?.maxLevel ?? null,
    nextMinScore: next?.minScore ?? null,
    progressRatio,
  };
}

export function getDropVariantPool(level: number): string[] {
  return DROP_VARIANTS[level] ?? [getCatDefinition(level)?.assetKey ?? RESULT_MASCOT_ASSET_KEY];
}
