import { describe, expect, test } from "vitest";

import {
  activateTargetTool,
  applyDestructiveToolUse,
  cancelTargetTool,
  consumeInstantTool,
  createToolState,
  tickToolState
} from "../../src/game/systems/toolState";

describe("tool state", () => {
  test("starts with the agreed V1 inventory", () => {
    const state = createToolState();

    expect(state.counts).toEqual({ refresh: 2, shake: 1, hammer: 1, bomb: 1 });
    expect(state.activeTargetTool).toBeNull();
    expect(state.immunityMs).toBe(0);
  });

  test("refresh consumes one charge without entering targeting", () => {
    const state = consumeInstantTool(createToolState(), "refresh");

    expect(state.counts.refresh).toBe(1);
    expect(state.activeTargetTool).toBeNull();
    expect(state.immunityMs).toBe(0);
  });

  test("shake consumes one charge and grants short immunity", () => {
    const state = consumeInstantTool(createToolState(), "shake");

    expect(state.counts.shake).toBe(0);
    expect(state.immunityMs).toBe(1800);
  });

  test("hammer enters targeting mode and destructive use consumes charge plus immunity", () => {
    const targeted = activateTargetTool(createToolState(), "hammer");
    const used = applyDestructiveToolUse(targeted);

    expect(targeted.activeTargetTool).toBe("hammer");
    expect(used.activeTargetTool).toBeNull();
    expect(used.counts.hammer).toBe(0);
    expect(used.immunityMs).toBe(1800);
  });

  test("cancelTargetTool exits targeting without consuming charges", () => {
    const targeted = activateTargetTool(createToolState(), "bomb");
    const cancelled = cancelTargetTool(targeted);

    expect(cancelled.activeTargetTool).toBeNull();
    expect(cancelled.counts.bomb).toBe(1);
  });

  test("immunity ticks down to zero", () => {
    const state = tickToolState(consumeInstantTool(createToolState(), "shake"), 500);

    expect(state.immunityMs).toBe(1300);
    expect(tickToolState(state, 2000).immunityMs).toBe(0);
  });
});
