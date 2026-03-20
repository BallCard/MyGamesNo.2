# START HERE FOR NEW AGENT

## 0. 目标

如果你是第一次接手这个项目，不要扫描全仓。先用这份卡片在最短时间内建立正确心智模型。

目标是在 `5-10 分钟` 内搞清楚：

- 这个项目是什么
- 当前最重要的架构边界是什么
- 哪些坑已经踩过，绝不能再犯
- 先看哪几个文件最值

---

## 1. 先读这 5 份文档

### 1. `docs/PRD.md`
先理解产品目标、玩家、核心情绪、传播方式。

### 2. `docs/superpowers/specs/2026-03-20-zju-cat-merge-design.md`
理解完整设计约束，不要凭感觉改玩法。

### 3. `docs/playbook/guides/2D-Web-Game-VibeCoding-Architecture-and-Debugging-Guide.md`
先读复盘。这里写了最重要的架构铁律和历史大坑。

### 4. `docs/playbook/guides/Next-Phase-Optimization-and-Agent-Handoff-Guide.md`
理解当前还能优化什么，以及这项目的接手顺序。

### 5. `docs/FRONTEND_GUIDELINES.md`
理解当前 UI / 前端边界，不要把实现做回旧问题。

---

## 2. 再看这 5 个核心代码文件

### 1. `src/main.ts`
应用壳、首页、游戏挂载入口。

### 2. `src/game/scenes/GameScene.ts`
整个项目的核心运行场景，大部分行为都在这里收口。

### 3. `src/game/systems/runState.ts`
生成规则、分数驱动解锁、queued next 逻辑。

### 4. `src/game/systems/inputPolicy.ts`
输入链边界，误触、按钮、拖拽、抑制逻辑的关键点。

### 5. `src/game/hud/domHud.ts`
DOM HUD 层，负责高质感 UI，不负责主游戏逻辑。

如果还有时间，再补：

- `src/game/hud/bridge.ts`
- `src/game/systems/hudActionQueue.ts`
- `src/game/systems/mergeSystem.ts`
- `src/game/systems/dangerSystem.ts`

---

## 3. 先跑这 4 组测试

```powershell
npm test -- tests/game/run-state.test.ts
npm test -- tests/game/merge-system.test.ts
npm test -- tests/game/input-policy.test.ts
npm test -- tests/smoke/app-start.test.ts
```

如果这 4 组不稳，就不要急着加功能。

最后再跑：

```powershell
npm run build
```

---

## 4. 这个项目的本质

这不是一个普通 Phaser 小游戏，而是一个：

- `Suika-like` 掉落合成游戏
- `Phaser + Matter` 跑游戏世界
- `DOM overlay` 跑高级 HUD
- 移动端优先
- 玩法稳定性优先于视觉花哨

当前最危险的耦合点始终是：

- 合成事务
- 输入链
- DOM HUD -> Scene 命令桥
- 物理层与表现层的混用

---

## 5. 绝不能重犯的 5 条错误

1. 不要把透明猫图直接当物理碰撞体。
2. 不要在 `collisionStart` 里同步完成整套合成事务。
3. 不要对 Matter body 做 scale / tween 弹跳。
4. 不要在 DOM 按钮事件里直接乱改 Scene 状态。
5. 不要一上来全仓扫描、顺手大改多个系统。

---

## 6. 接手后的第一轮动作

正确顺序：

1. 先判断当前任务属于哪一层
2. 先找相关测试
3. 先确认影响范围
4. 一次只改一条边界
5. 改完先跑专项测试，再跑 build，再人工验证

错误顺序：

- 直接开始改 UI
- 直接加新功能
- 不看复盘就重构
- 一个回合同时修 3 个系统

---

## 7. 如果要继续往下做

优先参考：

- `docs/playbook/guides/Next-Phase-Optimization-and-Agent-Handoff-Guide.md`
- `docs/playbook/templates/GAME_DEBUG_TESTING_TEMPLATE.md`
- `docs/playbook/templates/SUBAGENT_REVIEW_PROMPT_TEMPLATE.md`

这三份会告诉你：

- 下一步从哪里选 backlog
- 遇到 bug 怎么规范化处理
- 怎么把问题交给 subagent 审，而不是乱问
