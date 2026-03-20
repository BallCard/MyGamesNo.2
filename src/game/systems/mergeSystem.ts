import { getNextCatLevel, getScoreForMerge } from "../config/cats";

export type MergeResolution = {
  merged: boolean;
  resultLevel: number | null;
  scoreGained: number;
};

export function mergeCatLevels(
  leftLevel: number,
  rightLevel: number
): MergeResolution {
  if (leftLevel !== rightLevel) {
    return {
      merged: false,
      resultLevel: null,
      scoreGained: 0
    };
  }

  const nextLevel = getNextCatLevel(leftLevel);
  if (nextLevel === null) {
    return {
      merged: false,
      resultLevel: null,
      scoreGained: 0
    };
  }

  return {
    merged: true,
    resultLevel: nextLevel,
    scoreGained: getScoreForMerge(nextLevel)
  };
}
