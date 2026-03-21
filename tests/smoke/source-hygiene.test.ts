import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const MAIN_PATH = join(process.cwd(), "src", "main.ts");
const STYLES_PATH = join(process.cwd(), "src", "styles.css");
const GAME_SCENE_PATH = join(process.cwd(), "src", "game", "scenes", "GameScene.ts");
const COMBO_STATE_PATH = join(process.cwd(), "src", "game", "systems", "comboState.ts");

const SOURCE_FILES = [
  MAIN_PATH,
  STYLES_PATH,
  GAME_SCENE_PATH,
  COMBO_STATE_PATH,
];

describe("source hygiene", () => {
  test("source files do not contain replacement artifacts or UTF-8 BOM", () => {
    for (const file of SOURCE_FILES) {
      const content = readFileSync(file, "utf8");

      expect(content.charCodeAt(0), `${file} should not start with a BOM`).not.toBe(0xfeff);
      expect(content.includes("`r`n"), `${file} should not contain literal PowerShell newline escapes`).toBe(false);
    }
  });

  test("GameScene keeps merge return flow and hud action return flow distinct", () => {
    const content = readFileSync(GAME_SCENE_PATH, "utf8");
    const mergeSection = content.match(/private processPendingMerges\(\): boolean \{[\s\S]*?private resolveMerge\(/)?.[0] ?? "";
    const hudSection = content.match(/private processPendingHudActions\(\): void \{[\s\S]*?private resetRound\(/)?.[0] ?? "";

    expect(mergeSection).toContain("return resolvedMerges;");
    expect(hudSection).not.toContain("return resolvedMerges;");
    expect(hudSection).toContain("if (!shifted.next)");
    expect(hudSection).toContain("return;");
  });

  test("GameScene locks merge processing once game over is active", () => {
    const content = readFileSync(GAME_SCENE_PATH, "utf8");
    const updateSection = content.match(/update\(_: number, delta: number\): void \{[\s\S]*?private ensureBallTexture\(/)?.[0] ?? "";
    const collisionSection = content.match(/private registerCollisions\(\): void \{[\s\S]*?private processPendingMerges\(/)?.[0] ?? "";

    expect(updateSection).toContain("if (this.dangerState.isGameOver)");
    expect(updateSection).toContain("this.mergeQueue = createMergeQueue();");
    expect(updateSection).toContain("return;");
    expect(collisionSection).toContain("if (this.dangerState.isGameOver)");
  });
});
