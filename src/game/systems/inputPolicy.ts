export type PointerUpSuppression = "none" | "playfield";
export type InputActionSource = "overlay" | "playfield";

type PointerUpDropPolicy = {
  isGameOver: boolean;
  hasActiveTargetTool: boolean;
  suppression: PointerUpSuppression;
};

export function shouldDropOnPointerUp(policy: PointerUpDropPolicy): boolean {
  if (policy.hasActiveTargetTool) {
    return false;
  }

  if (policy.isGameOver) {
    return false;
  }

  if (policy.suppression !== "none") {
    return false;
  }

  return true;
}

export function getPointerUpSuppression(source: InputActionSource): PointerUpSuppression {
  return source === "playfield" ? "playfield" : "none";
}

export function resolvePointerDownSuppression(
  current: PointerUpSuppression,
  hasActiveTargetTool: boolean,
): PointerUpSuppression {
  if (!hasActiveTargetTool) {
    return "none";
  }

  return current;
}
