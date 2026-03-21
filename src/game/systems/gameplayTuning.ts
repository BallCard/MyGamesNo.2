export const DROP_COOLDOWN_MS = 180;

export const COMBO_WINDOW_MS = 1100;

export const COMBO_BONUS_BY_COUNT: Record<number, number> = {
  2: 20,
  3: 60,
  4: 120,
  5: 200,
};

export const COMBO_BONUS_OVERFLOW_STEP = 120;
export const COMBO_BONUS_OVERFLOW_START_COUNT = 5;
export const COMBO_BONUS_OVERFLOW_START_VALUE = COMBO_BONUS_BY_COUNT[COMBO_BONUS_OVERFLOW_START_COUNT] ?? 0;

export const SCORE_UNLOCKS = [
  { minScore: 0, maxLevel: 1 },
  { minScore: 80, maxLevel: 2 },
  { minScore: 240, maxLevel: 3 },
  { minScore: 560, maxLevel: 4 },
  { minScore: 1200, maxLevel: 5 },
  { minScore: 2400, maxLevel: 6 },
  { minScore: 4200, maxLevel: 7 },
  { minScore: 6800, maxLevel: 8 },
] as const;

export const COMBO_FEEDBACK_STYLE = {
  minY: 148,
  maxY: 208,
  playfieldRatio: 0.34,
  enterOffsetY: 8,
  enterScale: 0.72,
  enterDurationMs: 220,
  fontSizePx: 42,
  strokeThicknessPx: 10,
  baseColor: "#fffdf6",
  hotColor: "#fff6e0",
  peakColor: "#fff2cf",
  strokeColor: "#c7511f",
  shadowColor: "#6f230c",
  shadowBlur: 10,
  shadowOffsetY: 10,
} as const;