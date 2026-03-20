import type { ToolKind } from "./toolState";

export type HudAction = { kind: "restart" } | { kind: "tool"; tool: ToolKind };
export type HudActionQueue = HudAction[];

export function enqueueHudAction(queue: HudActionQueue, action: HudAction): HudActionQueue {
  return [...queue, action];
}

export function shiftNextHudAction(queue: HudActionQueue): { queue: HudActionQueue; next?: HudAction } {
  if (queue.length === 0) {
    return { queue };
  }

  const [next, ...rest] = queue;
  return {
    queue: rest,
    next,
  };
}
