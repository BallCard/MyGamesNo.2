import {
  COMBO_BONUS_BY_COUNT,
  COMBO_BONUS_OVERFLOW_START_COUNT,
  COMBO_BONUS_OVERFLOW_START_VALUE,
  COMBO_BONUS_OVERFLOW_STEP,
  COMBO_WINDOW_MS,
  MAX_COMBO_COUNT,
} from "./gameplayTuning";

export type ComboState = {
  comboCount: number;
  remainingWindowMs: number;
};

export type ComboConsumeResult = {
  nextState: ComboState;
  bonus: number;
  shouldShowCombo: boolean;
};

export function createComboState(): ComboState {
  return {
    comboCount: 0,
    remainingWindowMs: 0
  };
}

export function getComboBonus(comboCount: number): number {
  const cappedComboCount = Math.min(MAX_COMBO_COUNT, comboCount);

  if (cappedComboCount <= 1) {
    return 0;
  }

  const configuredBonus = COMBO_BONUS_BY_COUNT[cappedComboCount];
  if (configuredBonus !== undefined) {
    return configuredBonus;
  }

  if (cappedComboCount <= COMBO_BONUS_OVERFLOW_START_COUNT) {
    return 0;
  }

  return COMBO_BONUS_OVERFLOW_START_VALUE + (cappedComboCount - COMBO_BONUS_OVERFLOW_START_COUNT) * COMBO_BONUS_OVERFLOW_STEP;
}

export function tickComboState(state: ComboState, deltaMs: number): ComboState {
  const remainingWindowMs = Math.max(0, state.remainingWindowMs - deltaMs);

  if (remainingWindowMs > 0) {
    return {
      ...state,
      remainingWindowMs
    };
  }

  return createComboState();
}

export function finalizeComboFrame(
  state: ComboState,
  deltaMs: number,
  mergeResolvedThisFrame: boolean,
): ComboState {
  if (mergeResolvedThisFrame) {
    return state;
  }

  return tickComboState(state, deltaMs);
}

export function consumeComboMerge(state: ComboState): ComboConsumeResult {
  const comboCount = Math.min(MAX_COMBO_COUNT, state.remainingWindowMs > 0 ? state.comboCount + 1 : 1);

  return {
    nextState: {
      comboCount,
      remainingWindowMs: COMBO_WINDOW_MS
    },
    bonus: getComboBonus(comboCount),
    shouldShowCombo: comboCount >= 2
  };
}