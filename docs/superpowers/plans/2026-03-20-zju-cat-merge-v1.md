# ZJU Cat Merge V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first web version of ZJU Cat Merge with core merge gameplay, forgiving fail logic, four tools, screenshot sharing, and lightweight online leaderboards.

**Architecture:** Use a Phaser 3 + Matter.js frontend for gameplay and a thin Vercel serverless backend for anonymous player identity and leaderboard APIs. Keep gameplay state client-side, upload only final run results, and isolate art processing into an offline asset pipeline that exports static transparent PNG assets.

**Tech Stack:** TypeScript, Vite, Phaser 3, Matter.js, CSS variables, Vercel Functions, Postgres-compatible hosted database, Vitest, Playwright

---

## Proposed File Structure

- `package.json`
- `vite.config.ts`
- `src/main.ts`
- `src/game/`
- `src/game/scenes/BootScene.ts`
- `src/game/scenes/GameScene.ts`
- `src/game/systems/mergeSystem.ts`
- `src/game/systems/dangerSystem.ts`
- `src/game/systems/toolSystem.ts`
- `src/game/systems/comboSystem.ts`
- `src/game/config/cats.ts`
- `src/game/config/theme.ts`
- `src/ui/`
- `src/ui/AppShell.tsx` or equivalent DOM shell module
- `src/ui/components/LeaderboardPanel.*`
- `src/ui/components/ResultCard.*`
- `src/ui/components/SettingsModal.*`
- `src/lib/api.ts`
- `src/lib/player.ts`
- `public/assets/cats/`
- `scripts/process-cat-assets.*`
- `api/player/init.ts`
- `api/player/nickname.ts`
- `api/runs.ts`
- `api/leaderboard/global.ts`
- `api/leaderboard/weekly.ts`
- `tests/`

### Task 1: Bootstrap Project Skeleton

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `src/main.ts`
- Create: `src/game/scenes/BootScene.ts`
- Create: `src/game/scenes/GameScene.ts`
- Create: `src/game/config/theme.ts`
- Test: `tests/smoke/app-start.test.ts`

- [ ] **Step 1: Write the failing smoke test**
- [ ] **Step 2: Run test to verify it fails**
Run: `npm test -- tests/smoke/app-start.test.ts`
Expected: fail because the app shell does not exist yet.
- [ ] **Step 3: Write minimal boot implementation**
- [ ] **Step 4: Run test to verify it passes**
Run: `npm test -- tests/smoke/app-start.test.ts`
Expected: pass.
- [ ] **Step 5: Commit**
Run: `git add package.json vite.config.ts src tests`
Run: `git commit -m "feat: bootstrap zju cat merge app shell"`

### Task 2: Implement Core Drop and Merge Loop

**Files:**
- Modify: `src/game/scenes/GameScene.ts`
- Create: `src/game/systems/mergeSystem.ts`
- Create: `src/game/config/cats.ts`
- Test: `tests/game/merge-system.test.ts`

- [ ] **Step 1: Write failing merge-system tests**
- [ ] **Step 2: Run merge tests and confirm failure**
Run: `npm test -- tests/game/merge-system.test.ts`
Expected: fail because merge logic is missing.
- [ ] **Step 3: Implement minimal merge system**
- [ ] **Step 4: Run tests and verify pass**
Run: `npm test -- tests/game/merge-system.test.ts`
Expected: pass.
- [ ] **Step 5: Commit**
Run: `git add src tests`
Run: `git commit -m "feat: add core drop and merge loop"`

### Task 3: Add Red-Line Danger System

**Files:**
- Create: `src/game/systems/dangerSystem.ts`
- Modify: `src/game/scenes/GameScene.ts`
- Test: `tests/game/danger-system.test.ts`

- [ ] **Step 1: Write failing danger-system tests**
- [ ] **Step 2: Run the danger tests**
Run: `npm test -- tests/game/danger-system.test.ts`
Expected: fail because danger logic is absent.
- [ ] **Step 3: Implement the danger system**
- [ ] **Step 4: Run tests and verify pass**
Run: `npm test -- tests/game/danger-system.test.ts`
Expected: pass.
- [ ] **Step 5: Commit**
Run: `git add src tests`
Run: `git commit -m "feat: add forgiving red-line danger system"`

### Task 4: Add Tool System

**Files:**
- Create: `src/game/systems/toolSystem.ts`
- Modify: `src/game/scenes/GameScene.ts`
- Test: `tests/game/tool-system.test.ts`

- [ ] **Step 1: Write failing tool tests**
- [ ] **Step 2: Run tool tests**
Run: `npm test -- tests/game/tool-system.test.ts`
Expected: fail because tool logic is not implemented.
- [ ] **Step 3: Implement the tool system**
- [ ] **Step 4: Run tests and verify pass**
Run: `npm test -- tests/game/tool-system.test.ts`
Expected: pass.
- [ ] **Step 5: Commit**
Run: `git add src tests`
Run: `git commit -m "feat: add run tools and target mode safety"`

### Task 5: Add Combo and Feedback Systems

**Files:**
- Create: `src/game/systems/comboSystem.ts`
- Modify: `src/game/scenes/GameScene.ts`
- Modify: `src/game/config/theme.ts`
- Test: `tests/game/combo-system.test.ts`

- [ ] **Step 1: Write failing combo tests**
- [ ] **Step 2: Run combo tests**
Run: `npm test -- tests/game/combo-system.test.ts`
Expected: fail.
- [ ] **Step 3: Implement combo state and feedback hooks**
- [ ] **Step 4: Run tests and verify pass**
Run: `npm test -- tests/game/combo-system.test.ts`
Expected: pass.
- [ ] **Step 5: Commit**
Run: `git add src tests`
Run: `git commit -m "feat: add combo timing and peak feedback hooks"`

### Task 6: Build UI Shell, Result Card, and Screenshot Export

**Files:**
- Create: `src/ui/AppShell.*`
- Create: `src/ui/components/ResultCard.*`
- Create: `src/ui/components/SettingsModal.*`
- Modify: `src/main.ts`
- Test: `tests/ui/result-card.test.ts`

- [ ] **Step 1: Write failing UI tests**
- [ ] **Step 2: Run UI tests**
Run: `npm test -- tests/ui/result-card.test.ts`
Expected: fail.
- [ ] **Step 3: Implement UI shell and result card**
- [ ] **Step 4: Run tests and verify pass**
Run: `npm test -- tests/ui/result-card.test.ts`
Expected: pass.
- [ ] **Step 5: Commit**
Run: `git add src tests`
Run: `git commit -m "feat: add result card and screenshot sharing flow"`

### Task 7: Process Cat Assets

**Files:**
- Create: `scripts/process-cat-assets.*`
- Create: `public/assets/cats/`
- Test: `tests/scripts/process-cat-assets.test.ts`

- [ ] **Step 1: Write failing asset-pipeline tests**
- [ ] **Step 2: Run asset tests**
Run: `npm test -- tests/scripts/process-cat-assets.test.ts`
Expected: fail.
- [ ] **Step 3: Implement asset processing script**
- [ ] **Step 4: Run tests and verify pass**
Run: `npm test -- tests/scripts/process-cat-assets.test.ts`
Expected: pass.
- [ ] **Step 5: Commit**
Run: `git add scripts public tests`
Run: `git commit -m "feat: add cat asset processing pipeline"`

### Task 8: Add Backend APIs and Database Access

**Files:**
- Create: `api/player/init.ts`
- Create: `api/player/nickname.ts`
- Create: `api/runs.ts`
- Create: `api/leaderboard/global.ts`
- Create: `api/leaderboard/weekly.ts`
- Create: `src/lib/api.ts`
- Create: `src/lib/player.ts`
- Test: `tests/api/runs.test.ts`
- Test: `tests/api/leaderboard.test.ts`

- [ ] **Step 1: Write failing API tests**
- [ ] **Step 2: Run API tests**
Run: `npm test -- tests/api/runs.test.ts tests/api/leaderboard.test.ts`
Expected: fail.
- [ ] **Step 3: Implement minimal backend endpoints**
- [ ] **Step 4: Run tests and verify pass**
Run: `npm test -- tests/api/runs.test.ts tests/api/leaderboard.test.ts`
Expected: pass.
- [ ] **Step 5: Commit**
Run: `git add api src tests`
Run: `git commit -m "feat: add anonymous player and leaderboard apis"`

### Task 9: Wire Frontend to Online Features

**Files:**
- Modify: `src/ui/AppShell.*`
- Modify: `src/lib/api.ts`
- Modify: `src/lib/player.ts`
- Test: `tests/integration/online-flow.test.ts`

- [ ] **Step 1: Write failing integration test**
- [ ] **Step 2: Run integration test**
Run: `npm test -- tests/integration/online-flow.test.ts`
Expected: fail.
- [ ] **Step 3: Implement API integration**
- [ ] **Step 4: Run tests and verify pass**
Run: `npm test -- tests/integration/online-flow.test.ts`
Expected: pass.
- [ ] **Step 5: Commit**
Run: `git add src tests`
Run: `git commit -m "feat: connect gameplay results to online leaderboard flow"`

### Task 10: Verify Mobile UX and Release Readiness

**Files:**
- Modify: `src/ui/*`
- Modify: `src/game/*`
- Test: `tests/e2e/mobile-smoke.spec.ts`
- Test: `tests/e2e/leaderboard.spec.ts`

- [ ] **Step 1: Write or complete E2E coverage**
- [ ] **Step 2: Run E2E tests and confirm gaps**
Run: `npx playwright test tests/e2e/mobile-smoke.spec.ts tests/e2e/leaderboard.spec.ts`
Expected: failures reveal final polish or layout issues.
- [ ] **Step 3: Fix release-blocking issues**
- [ ] **Step 4: Run final verification**
Run: `npm test`
Run: `npx playwright test`
Expected: all relevant tests pass.
- [ ] **Step 5: Commit**
Run: `git add .`
Run: `git commit -m "feat: finalize zju cat merge v1 release candidate"`
