export type ResultPayload = {
  score: number;
  peakLevel: number;
  bestScore: number;
  isNewBest: boolean;
};

export function isNewBest(score: number, bestScore: number): boolean {
  return score > bestScore;
}

export function buildResultPayload(input: {
  score: number;
  peakLevel: number;
  bestScore: number;
}): ResultPayload {
  return {
    ...input,
    isNewBest: isNewBest(input.score, input.bestScore)
  };
}
