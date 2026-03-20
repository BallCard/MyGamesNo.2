import { getDropVariantPool, getUnlockedMaxDropLevel, type QueuedCat } from "../config/cats";

export type RunState = {
  score: number;
  queuedNext: QueuedCat;
  cooldownMs: number;
  randomSeed: number;
};

export type DropResult = {
  droppedCat: QueuedCat | null;
  nextState: RunState;
};

const DROP_COOLDOWN_MS = 180;

function nextSeed(seed: number): number {
  return (seed * 1664525 + 1013904223) >>> 0;
}

function chooseWeightedLevel(seed: number, maxLevel: number): { level: number; seed: number } {
  const rolledSeed = nextSeed(seed);
  const levels = Array.from({ length: maxLevel }, (_, index) => index + 1);
  const weights = levels.map((level) => {
    let weight = 2;
    if (level === 1) weight += 14;
    else if (level === 2) weight += 10;
    else if (level === 3) weight += 6;

    if (level === maxLevel) weight += 6;
    else if (level === maxLevel - 1 && maxLevel > 4) weight += 3;
    else if (level === maxLevel - 2 && maxLevel > 5) weight += 1;

    return weight;
  });

  const total = weights.reduce((sum, value) => sum + value, 0);
  let pick = rolledSeed % total;

  for (let index = 0; index < levels.length; index += 1) {
    pick -= weights[index];
    if (pick < 0) {
      return { level: levels[index], seed: rolledSeed };
    }
  }

  return { level: 1, seed: rolledSeed };
}

function chooseVariant(
  seed: number,
  level: number,
  previousQueued?: QueuedCat
): { queued: QueuedCat; seed: number } {
  const rolledSeed = nextSeed(seed);
  const pool = getDropVariantPool(level);
  let assetKey = pool[rolledSeed % pool.length];

  if (
    previousQueued &&
    previousQueued.level === level &&
    previousQueued.assetKey === assetKey &&
    pool.length > 1
  ) {
    assetKey = pool[(rolledSeed + 1) % pool.length];
  }

  return {
    queued: { level, assetKey },
    seed: rolledSeed
  };
}

export function rollQueuedCat(
  seed: number,
  score: number,
  previousQueued?: QueuedCat
): { queued: QueuedCat; seed: number } {
  const unlockedMaxLevel = getUnlockedMaxDropLevel(score);
  const levelRoll = chooseWeightedLevel(seed, unlockedMaxLevel);
  return chooseVariant(levelRoll.seed, levelRoll.level, previousQueued);
}

export function createRunState(seed: number = Date.now()): RunState {
  const initial = rollQueuedCat(seed, 0);

  return {
    score: 0,
    queuedNext: initial.queued,
    cooldownMs: 0,
    randomSeed: initial.seed
  };
}

export function dropCurrentCat(state: RunState): DropResult {
  if (state.cooldownMs > 0) {
    return {
      droppedCat: null,
      nextState: state
    };
  }

  const next = rollQueuedCat(state.randomSeed, state.score, state.queuedNext);

  return {
    droppedCat: state.queuedNext,
    nextState: {
      ...state,
      queuedNext: next.queued,
      cooldownMs: DROP_COOLDOWN_MS,
      randomSeed: next.seed
    }
  };
}

export function tickRunState(state: RunState, deltaMs: number): RunState {
  return {
    ...state,
    cooldownMs: Math.max(0, state.cooldownMs - deltaMs)
  };
}

export function awardScore(state: RunState, scoreDelta: number): RunState {
  return {
    ...state,
    score: state.score + scoreDelta
  };
}

export function rerollQueuedNext(state: RunState): RunState {
  const next = rollQueuedCat(state.randomSeed, state.score, state.queuedNext);

  return {
    ...state,
    queuedNext: next.queued,
    randomSeed: next.seed
  };
}
