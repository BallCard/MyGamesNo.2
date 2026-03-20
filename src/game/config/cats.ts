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

const SCORE_UNLOCKS = [
  { minScore: 0, maxLevel: 4 },
  { minScore: 450, maxLevel: 5 },
  { minScore: 1200, maxLevel: 6 },
  { minScore: 2600, maxLevel: 7 },
  { minScore: 4800, maxLevel: 8 }
] as const;

const CAT_RADII = [20, 22, 24, 27, 30, 34, 39, 45, 52, 60, 69, 79] as const;

export const CAT_DEFINITIONS: CatDefinition[] = Array.from(
  { length: 12 },
  (_, index) => {
    const level = index + 1;

    return {
      level,
      assetKey: `cat-${level}`,
      scoreValue: level * 10
    };
  }
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
  12: ["cat-12", "cat-12-v2", "cat-12-v3"]
};

export const ALL_CAT_ASSET_KEYS = Array.from(
  new Set([...CAT_DEFINITIONS.map((cat) => cat.assetKey), ...Object.values(DROP_VARIANTS).flat()])
);

export function getCatDefinition(level: number): CatDefinition | null {
  return CAT_DEFINITIONS.find((cat) => cat.level === level) ?? null;
}

export function getCatRadius(level: number): number {
  return CAT_RADII[Math.max(0, Math.min(CAT_RADII.length - 1, level - 1))];
}

export function getNextCatLevel(level: number): number | null {
  const next = getCatDefinition(level + 1);
  return next?.level ?? null;
}

export function getScoreForMerge(level: number): number {
  return getCatDefinition(level)?.scoreValue ?? 0;
}

export function getUnlockedMaxDropLevel(score: number): number {
  let maxLevel = 4;
  for (const unlock of SCORE_UNLOCKS) {
    if (score >= unlock.minScore) {
      maxLevel = unlock.maxLevel;
    }
  }
  return Math.min(maxLevel, 8);
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
    progressRatio
  };
}

export function getDropVariantPool(level: number): string[] {
  return DROP_VARIANTS[level] ?? [getCatDefinition(level)?.assetKey ?? `cat-${level}`];
}
