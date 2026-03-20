import Phaser from "phaser";

import {
  getCatRadius,
  getDropVariantPool,
  getScoreForMerge,
  getUnlockProgress,
  type QueuedCat
} from "../config/cats";
import {
  createDangerState,
  shouldCountDangerCandidate,
  updateDangerState
} from "../systems/dangerSystem";
import { createMergeQueue, enqueueMergePair, shiftNextMerge } from "../systems/mergeQueue";
import { BOMB_DELETE_RADIUS, BOMB_KNOCKBACK_RADIUS, classifyBombImpact } from "../systems/bombEffect";
import { mergeCatLevels } from "../systems/mergeSystem";
import {
  getMergeFeedbackStyle,
  getMergedSpawnPlacement,
  getMergeSpawnPolicy
} from "../systems/physicsPolicy";
import {
  awardScore,
  createRunState,
  dropCurrentCat,
  rerollQueuedNext,
  tickRunState
} from "../systems/runState";
import {
  activateTargetTool,
  applyDestructiveToolUse,
  cancelTargetTool,
  consumeInstantTool,
  createToolState,
  tickToolState,
  type ToolKind,
  type ToolState
} from "../systems/toolState";

type BallBody = Phaser.Physics.Matter.Image & {
  __ballId?: string;
  __mergeLocked?: boolean;
  __spawnedAt?: number;
};

type CatBall = {
  id: string;
  level: number;
  assetKey: string;
  radius: number;
  body: BallBody;
  face: Phaser.GameObjects.Image;
};

type ToolButton = {
  kind: ToolKind;
  background: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
  count: Phaser.GameObjects.Text;
};

export class GameScene extends Phaser.Scene {
  private runState = createRunState(12345);
  private toolState: ToolState = createToolState();
  private dangerState = createDangerState();
  private pointerX = 222;
  private isAiming = false;
  private scoreText?: Phaser.GameObjects.Text;
  private unlockText?: Phaser.GameObjects.Text;
  private unlockFill?: Phaser.GameObjects.Rectangle;
  private nextText?: Phaser.GameObjects.Text;
  private nextPreviewBase?: Phaser.GameObjects.Image;
  private nextPreviewFace?: Phaser.GameObjects.Image;
  private holdPreviewBase?: Phaser.GameObjects.Image;
  private holdPreviewFace?: Phaser.GameObjects.Image;
  private holdPreviewText?: Phaser.GameObjects.Text;
  private cooldownText?: Phaser.GameObjects.Text;
  private dangerFill?: Phaser.GameObjects.Rectangle;
  private aimLine?: Phaser.GameObjects.Graphics;
  private comboText?: Phaser.GameObjects.Text;
  private gameOverText?: Phaser.GameObjects.Text;
  private restartButton?: Phaser.GameObjects.Rectangle;
  private restartButtonText?: Phaser.GameObjects.Text;
  private gameOverRestartButton?: Phaser.GameObjects.Rectangle;
  private gameOverRestartText?: Phaser.GameObjects.Text;
  private targetHintText?: Phaser.GameObjects.Text;
  private redLineY = 210;
  private aimLineEndY = 258;
  private previewSpawnY = 184;
  private playfieldTop = 120;
  private playfieldBottom = 676;
  private leftWallX = 20;
  private rightWallX = 424;
  private ballIdCounter = 0;
  private balls = new Map<string, CatBall>();
  private mergeQueue = createMergeQueue();
  private toolButtons: ToolButton[] = [];

  constructor() {
    super("game");
  }

  create(): void {
    const width = this.scale.width;
    const height = this.scale.height;

    this.cameras.main.setBackgroundColor("#f7efd9");
    this.pointerX = width / 2;

    this.ensureBallTexture();
    this.drawHudFrame(width, height);
    this.createBounds(width, height);
    this.registerInput(width);
    this.registerCollisions();
    this.refreshHud();
    this.updateHoldPreview();
  }

  update(_: number, delta: number): void {
    this.runState = tickRunState(this.runState, delta);
    this.toolState = tickToolState(this.toolState, delta);
    this.syncBallFaces();

    const now = this.time.now;
    const dangerActive = Array.from(this.balls.values()).some((ball) => {
      const speed = Math.hypot(ball.body.body.velocity.x, ball.body.body.velocity.y);
      const top = ball.body.y - ball.radius;
      const ageMs = now - (ball.body.__spawnedAt ?? now);

      return shouldCountDangerCandidate({
        topY: top,
        redLineY: this.redLineY,
        speed,
        ageMs
      });
    });

    this.dangerState = updateDangerState(this.dangerState, {
      deltaMs: delta,
      isAboveLine: dangerActive,
      isStable: dangerActive,
      immunityMs: this.toolState.immunityMs
    });

    if (this.dangerState.isGameOver && this.gameOverText && !this.gameOverText.visible) {
      this.gameOverText.setVisible(true);
      this.gameOverRestartButton?.setVisible(true);
      this.gameOverRestartText?.setVisible(true);
      this.toolState = cancelTargetTool(this.toolState);
    }

    this.processPendingMerges();
    this.refreshHud();
    this.redrawAimLine();
    this.updateHoldPreview();
  }

  private ensureBallTexture(): void {
    if (this.textures.exists("cat-ball-base")) {
      return;
    }

    const size = 160;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xf6e6c8, 1);
    g.fillCircle(size / 2, size / 2, 70);
    g.lineStyle(6, 0xe8c79d, 1);
    g.strokeCircle(size / 2, size / 2, 70);
    g.fillStyle(0xffffff, 0.42);
    g.fillEllipse(size / 2 - 18, size / 2 - 26, 48, 28);
    g.generateTexture("cat-ball-base", size, size);
    g.destroy();
  }

  private drawHudFrame(width: number, height: number): void {
    this.add
      .rectangle(width / 2, 42, width - 24, 54, 0xfff7ea, 0.92)
      .setStrokeStyle(2, 0xe4ccb1, 0.9);

    this.add.text(28, 22, "Score", {
      color: "#5b3a29",
      fontFamily: "Microsoft YaHei UI",
      fontSize: "13px"
    });

    this.scoreText = this.add.text(28, 42, "0", {
      color: "#5b3a29",
      fontFamily: "Microsoft YaHei UI",
      fontSize: "22px",
      fontStyle: "bold"
    });

    this.add.rectangle(126, 50, 120, 8, 0xe9dbc5, 1).setOrigin(0, 0.5);
    this.unlockFill = this.add.rectangle(126, 50, 0, 8, 0xf2a65a, 1).setOrigin(0, 0.5);
    this.unlockText = this.add.text(126, 26, "Drop Lv.4", {
      color: "#8b5e3c",
      fontFamily: "Microsoft YaHei UI",
      fontSize: "12px",
      fontStyle: "bold"
    });

    this.add
      .text(width - 84, 22, "Next", {
        color: "#5b3a29",
        fontFamily: "Microsoft YaHei UI",
        fontSize: "13px"
      })
      .setOrigin(0.5, 0.5);

    this.nextPreviewBase = this.add.image(width - 92, 48, "cat-ball-base").setDisplaySize(38, 38);
    this.nextPreviewFace = this.add.image(width - 92, 48, "cat-1").setDisplaySize(28, 28);
    this.nextText = this.add
      .text(width - 28, 48, "", {
        color: "#5b3a29",
        fontFamily: "Microsoft YaHei UI",
        fontSize: "16px",
        fontStyle: "bold"
      })
      .setOrigin(1, 0.5);

    this.cooldownText = this.add
      .text(width / 2 + 10, 22, "Ready", {
        color: "#8b5e3c",
        fontFamily: "Microsoft YaHei UI",
        fontSize: "13px"
      })
      .setOrigin(0.5, 0.5);

    this.add.rectangle(width / 2, 98, width - 40, 8, 0xe9dbc5, 1).setOrigin(0.5);
    this.dangerFill = this.add.rectangle(20, 98, 0, 8, 0xd96c5f, 1).setOrigin(0, 0.5);

    this.restartButton = this.add
      .rectangle(width - 42, 98, 54, 26, 0xfff7ea, 0.98)
      .setStrokeStyle(2, 0xe4ccb1, 0.95)
      .setDepth(7)
      .setInteractive({ useHandCursor: true });
    this.restartButtonText = this.add
      .text(width - 42, 98, "Restart", {
        color: "#8b5e3c",
        fontFamily: "Microsoft YaHei UI",
        fontSize: "10px",
        fontStyle: "bold"
      })
      .setOrigin(0.5)
      .setDepth(8);
    this.restartButton.on("pointerdown", (_pointer: Phaser.Input.Pointer, _lx: number, _ly: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      this.resetRound();
    });

    this.targetHintText = this.add
      .text(width / 2, this.playfieldTop + 18, "", {
        color: "#c46d40",
        fontFamily: "Microsoft YaHei UI",
        fontSize: "14px",
        fontStyle: "bold",
        stroke: "#fff7ea",
        strokeThickness: 4
      })
      .setOrigin(0.5)
      .setDepth(9)
      .setVisible(false);

    this.add
      .rectangle(
        width / 2,
        (this.playfieldTop + this.playfieldBottom) / 2,
        width - 24,
        this.playfieldBottom - this.playfieldTop,
        0xfffaf2,
        0.75
      )
      .setStrokeStyle(2, 0xe4ccb1, 0.8);

    this.add
      .line(width / 2, this.redLineY, 0, 0, width - 40, 0, 0xd96c5f, 0.85)
      .setLineWidth(2);

    this.createToolButton(52, 396, "refresh", "🔄");
    this.createToolButton(52, 470, "shake", "📳");
    this.createToolButton(width - 52, 396, "hammer", "🔨");
    this.createToolButton(width - 52, 470, "bomb", "💣");


    this.holdPreviewBase = this.add.image(width / 2, this.previewSpawnY, "cat-ball-base").setDisplaySize(60, 60);
    this.holdPreviewFace = this.add.image(width / 2, this.previewSpawnY, "cat-1").setDisplaySize(44, 44);
    this.holdPreviewText = this.add
      .text(width / 2, this.previewSpawnY - 42, "", {
        color: "#8b5e3c",
        fontFamily: "Microsoft YaHei UI",
        fontSize: "13px",
        fontStyle: "bold"
      })
      .setOrigin(0.5, 0.5);

    this.comboText = this.add
      .text(width / 2, this.playfieldTop + 46, "", {
        color: "#d27c44",
        fontFamily: "Microsoft YaHei UI",
        fontSize: "24px",
        fontStyle: "bold",
        stroke: "#fff7ea",
        strokeThickness: 6
      })
      .setOrigin(0.5)
      .setDepth(9)
      .setVisible(false);

    this.gameOverText = this.add
      .text(width / 2, this.playfieldTop + 176, "Game Over", {
        color: "#5b3a29",
        fontFamily: "Microsoft YaHei UI",
        fontSize: "28px",
        fontStyle: "bold",
        align: "center",
        backgroundColor: "rgba(255,250,242,0.88)"
      })
      .setOrigin(0.5)
      .setDepth(10)
      .setPadding(18, 12, 18, 12)
      .setVisible(false);

    this.gameOverRestartButton = this.add
      .rectangle(width / 2, this.playfieldTop + 236, 142, 38, 0xf2a65a, 0.98)
      .setStrokeStyle(2, 0xe4ccb1, 0.95)
      .setDepth(10)
      .setVisible(false)
      .setInteractive({ useHandCursor: true });
    this.gameOverRestartText = this.add
      .text(width / 2, this.playfieldTop + 236, "再来一把", {
        color: "#fff9f2",
        fontFamily: "Microsoft YaHei UI",
        fontSize: "16px",
        fontStyle: "bold"
      })
      .setOrigin(0.5)
      .setDepth(11)
      .setVisible(false);
    this.gameOverRestartButton.on("pointerdown", (_pointer: Phaser.Input.Pointer, _lx: number, _ly: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      this.resetRound();
    });

    this.aimLine = this.add.graphics();
  }

  private createToolButton(x: number, y: number, kind: ToolKind, emoji: string): void {
    this.add
      .rectangle(x + 3, y + 5, 60, 60, 0xd6b892, 0.24)
      .setDepth(6);

    const background = this.add
      .rectangle(x, y, 60, 60, 0xfff7ea, 0.98)
      .setStrokeStyle(2, 0xe4ccb1, 0.95)
      .setDepth(7)
      .setInteractive({ useHandCursor: true });

    const label = this.add
      .text(x, y - 10, emoji, {
        fontFamily: "Microsoft YaHei UI",
        fontSize: "20px"
      })
      .setOrigin(0.5)
      .setDepth(8);

    const count = this.add
      .text(x, y + 15, "x0", {
        color: "#8b5e3c",
        fontFamily: "Microsoft YaHei UI",
        fontSize: "10px",
        fontStyle: "bold"
      })
      .setOrigin(0.5)
      .setDepth(8);

    background.on("pointerdown", (_pointer: Phaser.Input.Pointer, _lx: number, _ly: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      this.handleToolButton(kind);
    });

    this.toolButtons.push({ kind, background, label, count });
  }

  private createBounds(width: number, height: number): void {
    this.matter.add.rectangle(width / 2, this.playfieldBottom + 30, width - 20, 60, {
      isStatic: true,
      label: "floor"
    });
    this.matter.add.rectangle(this.leftWallX - 14, (this.playfieldTop + this.playfieldBottom) / 2, 28, height, {
      isStatic: true,
      label: "wall-left"
    });
    this.matter.add.rectangle(this.rightWallX + 14, (this.playfieldTop + this.playfieldBottom) / 2, 28, height, {
      isStatic: true,
      label: "wall-right"
    });
  }

  private registerInput(width: number): void {
    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (this.toolState.activeTargetTool) {
        return;
      }
      this.pointerX = Phaser.Math.Clamp(pointer.x, this.leftWallX + 26, this.rightWallX - 26);
      this.isAiming = pointer.isDown;
    });

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (this.dangerState.isGameOver) {
        return;
      }

      if (this.toolState.activeTargetTool) {
        this.tryResolveTargetTool(pointer.x, pointer.y);
        return;
      }

      this.pointerX = Phaser.Math.Clamp(pointer.x, this.leftWallX + 26, this.rightWallX - 26);
      this.isAiming = true;
      this.updateHoldPreview();
    });

    this.input.on("pointerup", () => {
      if (this.toolState.activeTargetTool) {
        this.isAiming = false;
        this.updateHoldPreview();
        return;
      }

      this.isAiming = false;
      if (this.dangerState.isGameOver) {
        this.updateHoldPreview();
        return;
      }

      const drop = dropCurrentCat(this.runState);
      this.runState = drop.nextState;
      if (drop.droppedCat !== null) {
        this.spawnDroppedBall(drop.droppedCat);
      }
      this.refreshHud();
      this.redrawAimLine();
      this.updateHoldPreview();
    });

    this.pointerX = width / 2;
  }

  private registerCollisions(): void {
    this.matter.world.on("collisionstart", (event: Phaser.Physics.Matter.Events.CollisionStartEvent) => {
      event.pairs.forEach((pair) => {
        const leftBody = pair.bodyA.gameObject as BallBody | undefined;
        const rightBody = pair.bodyB.gameObject as BallBody | undefined;
        const left = leftBody?.__ballId ? this.balls.get(leftBody.__ballId) : undefined;
        const right = rightBody?.__ballId ? this.balls.get(rightBody.__ballId) : undefined;

        if (!left || !right || left.id === right.id) {
          return;
        }

        if (left.body.__mergeLocked || right.body.__mergeLocked) {
          return;
        }

        const resolution = mergeCatLevels(left.level, right.level);
        if (!resolution.merged || resolution.resultLevel === null) {
          return;
        }

        left.body.__mergeLocked = true;
        right.body.__mergeLocked = true;
        this.mergeQueue = enqueueMergePair(
          this.mergeQueue,
          left.id,
          right.id,
          resolution.resultLevel,
          resolution.scoreGained
        );
      });
    });
  }

  private processPendingMerges(): void {
    while (true) {
      const shifted = shiftNextMerge(this.mergeQueue);
      this.mergeQueue = shifted.queue;

      if (!shifted.next) {
        return;
      }

      const left = this.balls.get(shifted.next.leftId);
      const right = this.balls.get(shifted.next.rightId);

      if (!left || !right || left.id === right.id) {
        if (left) {
          left.body.__mergeLocked = false;
        }
        if (right) {
          right.body.__mergeLocked = false;
        }
        continue;
      }

      this.resolveMerge(left, right, shifted.next.resultLevel, shifted.next.scoreGained);
    }
  }

  private resolveMerge(left: CatBall, right: CatBall, resultLevel: number, scoreGained: number): void {
    const mergedRadius = getCatRadius(resultLevel);
    const placement = getMergedSpawnPlacement({
      leftX: left.body.x,
      leftY: left.body.y,
      leftRadius: left.radius,
      rightX: right.body.x,
      rightY: right.body.y,
      rightRadius: right.radius,
      mergedRadius
    });

    this.destroyBall(left);
    this.destroyBall(right);

    const mergedQueued: QueuedCat = {
      level: resultLevel,
      assetKey: this.pickMergedAssetKey(resultLevel)
    };

    const merged = this.spawnDroppedBall(mergedQueued, placement.x, placement.y, true);
    if (getMergeFeedbackStyle() === "ring") {
      this.showMergeRing(placement.x, placement.y, merged.radius);
    }

    this.showScoreFloat(placement.x, placement.y - 28, scoreGained || getScoreForMerge(resultLevel));
    this.runState = awardScore(this.runState, scoreGained || getScoreForMerge(resultLevel));
  }

  private handleToolButton(kind: ToolKind): void {
    if (this.dangerState.isGameOver) {
      return;
    }

    if (kind === "refresh") {
      const nextState = consumeInstantTool(this.toolState, "refresh");
      if (nextState !== this.toolState) {
        this.toolState = nextState;
        this.runState = rerollQueuedNext(this.runState);
      }
      return;
    }

    if (kind === "shake") {
      const nextState = consumeInstantTool(this.toolState, "shake");
      if (nextState !== this.toolState) {
        this.toolState = nextState;
        this.applyShake();
      }
      return;
    }

    this.toolState = this.toolState.activeTargetTool === kind
      ? cancelTargetTool(this.toolState)
      : activateTargetTool(this.toolState, kind);
    this.isAiming = false;
    this.updateHoldPreview();
  }

  private applyShake(): void {
    this.balls.forEach((ball) => {
      const jitterX = Phaser.Math.FloatBetween(-5.6, 5.6);
      const boostY = Phaser.Math.FloatBetween(-12.8, -7.2);
      ball.body.setVelocity(ball.body.body.velocity.x + jitterX, boostY);
      ball.body.setAngularVelocity(Phaser.Math.FloatBetween(-0.04, 0.04));
      Phaser.Physics.Matter.Matter.Sleeping.set(ball.body.body, false);
    });
  }

  private tryResolveTargetTool(x: number, y: number): void {
    const target = this.findBallAt(x, y);
    if (!target) {
      this.toolState = cancelTargetTool(this.toolState);
      return;
    }

    const active = this.toolState.activeTargetTool;
    if (active === "hammer") {
      this.showMergeRing(target.body.x, target.body.y, target.radius);
      this.destroyBall(target);
      this.toolState = applyDestructiveToolUse(this.toolState);
      return;
    }

    if (active === "bomb") {
      this.applyBomb(target);
      this.toolState = applyDestructiveToolUse(this.toolState);
    }
  }

  private applyBomb(target: CatBall): void {
    const originX = target.body.x;
    const originY = target.body.y;
    const toDelete: CatBall[] = [target];

    this.balls.forEach((ball) => {
      if (ball.id === target.id) {
        return;
      }

      const dx = ball.body.x - originX;
      const dy = ball.body.y - originY;
      const distance = Math.max(1, Math.hypot(dx, dy));
      const impact = classifyBombImpact(distance);

      if (impact === "delete") {
        toDelete.push(ball);
        return;
      }

      if (impact === "knockback") {
        const strength = (BOMB_KNOCKBACK_RADIUS - distance) / (BOMB_KNOCKBACK_RADIUS - BOMB_DELETE_RADIUS);
        const vx = (dx / distance) * (6.8 * strength);
        const vy = (dy / distance) * (5.6 * strength) - 4.2 * strength;
        ball.body.setVelocity(ball.body.body.velocity.x + vx, ball.body.body.velocity.y + vy);
        ball.body.setAngularVelocity(Phaser.Math.FloatBetween(-0.14, 0.14));
        Phaser.Physics.Matter.Matter.Sleeping.set(ball.body.body, false);
      }
    });

    toDelete.forEach((ball) => {
      if (this.balls.has(ball.id)) {
        this.destroyBall(ball);
      }
    });

    this.showMergeRing(originX, originY, BOMB_DELETE_RADIUS * 1.16);
    this.showMergeRing(originX, originY, BOMB_KNOCKBACK_RADIUS * 0.58);
  }

  private findBallAt(x: number, y: number): CatBall | null {
    const candidates = Array.from(this.balls.values()).filter((ball) => {
      return Phaser.Math.Distance.Between(ball.body.x, ball.body.y, x, y) <= ball.radius;
    });

    if (candidates.length === 0) {
      return null;
    }

    return candidates.sort((a, b) => b.level - a.level)[0] ?? null;
  }

  private pickMergedAssetKey(level: number): string {
    const pool = getDropVariantPool(level);
    return pool[Math.floor(Math.random() * pool.length)] ?? `cat-${level}`;
  }

  private showMergeRing(x: number, y: number, radius: number): void {
    const ring = this.add
      .circle(x, y, radius * 0.86)
      .setStrokeStyle(4, 0xf2a65a, 0.72)
      .setFillStyle(0xffffff, 0)
      .setDepth(8);

    this.tweens.add({
      targets: ring,
      scaleX: 1.26,
      scaleY: 1.26,
      alpha: 0,
      duration: 160,
      onComplete: () => ring.destroy()
    });
  }

  private showScoreFloat(x: number, y: number, scoreGained: number): void {
    const floatText = this.add
      .text(x, y, `+${scoreGained}`, {
        color: "#d27c44",
        fontFamily: "Microsoft YaHei UI",
        fontSize: "22px",
        fontStyle: "bold",
        stroke: "#fff7ea",
        strokeThickness: 5
      })
      .setOrigin(0.5)
      .setDepth(9);

    this.tweens.add({
      targets: floatText,
      y: y - 28,
      alpha: 0,
      duration: 420,
      onComplete: () => floatText.destroy()
    });
  }

  private refreshHud(): void {
    this.scoreText?.setText(String(this.runState.score));
    this.nextText?.setText(`Lv.${this.runState.queuedNext.level}`);
    this.cooldownText?.setText(
      this.runState.cooldownMs > 0 ? `Cooldown ${Math.ceil(this.runState.cooldownMs)}ms` : "Ready"
    );

    if (this.nextPreviewBase && this.nextPreviewFace) {
      this.nextPreviewBase.setVisible(true);
      this.nextPreviewFace.setTexture(this.runState.queuedNext.assetKey);
      this.nextPreviewFace.setDisplaySize(28, 28);
    }

    const unlock = getUnlockProgress(this.runState.score);
    this.unlockText?.setText(
      unlock.nextMaxLevel
        ? `Drop Lv.${unlock.currentMaxLevel} -> Lv.${unlock.nextMaxLevel}`
        : `Drop Max Lv.${unlock.currentMaxLevel}`
    );
    this.unlockFill?.setSize(120 * unlock.progressRatio, 8);

    const ratio = Phaser.Math.Clamp(this.dangerState.accumulatedMs / 2200, 0, 1);
    this.dangerFill?.setSize((this.scale.width - 40) * ratio, 8);
    this.dangerFill?.setFillStyle(this.dangerState.isGameOver ? 0xbf4c3f : 0xd96c5f, 1);

    this.toolButtons.forEach((button) => {
      const isActive = this.toolState.activeTargetTool === button.kind;
      const count = this.toolState.counts[button.kind];
      button.count.setText(`x${count}`);
      button.background.setFillStyle(isActive ? 0xf7c6a3 : 0xfff7ea, count > 0 ? 0.98 : 0.72);
      button.background.setStrokeStyle(2, count > 0 ? (isActive ? 0xd27c44 : 0xe4ccb1) : 0xd6c7b3, 0.95);
      button.label.setAlpha(count > 0 ? 1 : 0.38);
      button.count.setAlpha(count > 0 ? 1 : 0.5);
    });

    if (this.targetHintText) {
      const active = this.toolState.activeTargetTool;
      this.targetHintText.setVisible(Boolean(active));
      this.targetHintText.setText(active ? `${active.toUpperCase()} · 点一只猫` : "");
    }
  }

  private redrawAimLine(): void {
    if (!this.aimLine) {
      return;
    }

    this.aimLine.clear();
    if (!this.isAiming || this.toolState.activeTargetTool !== null) {
      return;
    }

    this.aimLine.lineStyle(2, 0x8b5e3c, 0.4);

    for (let y = this.redLineY + 8; y < this.aimLineEndY; y += 14) {
      this.aimLine.beginPath();
      this.aimLine.moveTo(this.pointerX, y);
      this.aimLine.lineTo(this.pointerX, y + 7);
      this.aimLine.strokePath();
    }
  }

  private updateHoldPreview(): void {
    if (!this.holdPreviewBase || !this.holdPreviewFace || !this.holdPreviewText) {
      return;
    }

    const visible = this.isAiming && !this.dangerState.isGameOver && this.toolState.activeTargetTool === null;
    this.holdPreviewBase.setVisible(visible);
    this.holdPreviewFace.setVisible(visible);
    this.holdPreviewText.setVisible(visible);

    if (!visible) {
      return;
    }

    this.holdPreviewBase.setPosition(this.pointerX, this.previewSpawnY);
    this.holdPreviewFace.setTexture(this.runState.queuedNext.assetKey);
    this.holdPreviewFace.setDisplaySize(44, 44);
    this.holdPreviewFace.setPosition(this.pointerX, this.previewSpawnY);
    this.holdPreviewText.setText(`Lv.${this.runState.queuedNext.level}`);
    this.holdPreviewText.setPosition(this.pointerX, this.previewSpawnY - 42);
  }

  private resetRound(): void {
    this.balls.forEach((ball) => {
      ball.body.destroy();
      ball.face.destroy();
    });
    this.balls.clear();
    this.mergeQueue = createMergeQueue();
    this.runState = createRunState(Date.now());
    this.toolState = createToolState();
    this.dangerState = createDangerState();
    this.isAiming = false;
    this.gameOverText?.setVisible(false);
    this.gameOverRestartButton?.setVisible(false);
    this.gameOverRestartText?.setVisible(false);
    this.targetHintText?.setVisible(false);
    this.refreshHud();
    this.redrawAimLine();
    this.updateHoldPreview();
  }

  private spawnDroppedBall(
    queued: QueuedCat,
    spawnX?: number,
    spawnY?: number,
    merged: boolean = false
  ): CatBall {
    const radius = getCatRadius(queued.level);
    const x = Phaser.Math.Clamp(spawnX ?? this.pointerX, this.leftWallX + radius, this.rightWallX - radius);
    const y = spawnY ?? this.previewSpawnY;

    const body = this.matter.add.image(x, y, "cat-ball-base") as BallBody;
    body.setDisplaySize(radius * 2, radius * 2);
    body.setCircle(radius);
    body.setBounce(0.04);
    body.setFriction(0.08, 0.001, 0.03);
    body.setFrictionAir(0.02);
    body.setDepth(3);
    body.__mergeLocked = false;
    body.__spawnedAt = this.time.now;

    const face = this.add.image(x, y, queued.assetKey).setDisplaySize(radius * 1.45, radius * 1.45).setDepth(4);

    const ball: CatBall = {
      id: `ball-${this.ballIdCounter += 1}`,
      level: queued.level,
      assetKey: queued.assetKey,
      radius,
      body,
      face
    };

    body.__ballId = ball.id;
    this.balls.set(ball.id, ball);

    if (merged) {
      const policy = getMergeSpawnPolicy();
      body.setAngularVelocity(0);
      body.setVelocity(0, policy.impulseY);
      body.setIgnoreGravity(false);
      Phaser.Physics.Matter.Matter.Sleeping.set(body.body, false);
      body.__spawnedAt = this.time.now;
    }

    return ball;
  }

  private destroyBall(ball: CatBall): void {
    this.balls.delete(ball.id);
    ball.body.destroy();
    ball.face.destroy();
  }

  private syncBallFaces(): void {
    this.balls.forEach((ball) => {
      ball.face.setPosition(ball.body.x, ball.body.y);
      ball.face.setRotation(ball.body.rotation);
    });
  }
}








