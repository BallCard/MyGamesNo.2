import Phaser from "phaser";

import { BootScene } from "./scenes/BootScene";
import { GameScene } from "./scenes/GameScene";
import { MATTER_ENABLE_SLEEP } from "./systems/physicsPolicy";

export function createGame(target: HTMLElement): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent: target,
    width: 444,
    height: 720,
    transparent: true,
    backgroundColor: "#f7efd9",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
      default: "matter",
      matter: {
        gravity: {
          y: 1.05
        },
        enableSleep: MATTER_ENABLE_SLEEP
      }
    },
    scene: [BootScene, GameScene]
  });
}
