import { Graphics } from "pixi.js";
import { GAME_CONFIG } from "../config/gameConfig";

export class Player {
  readonly graphic = new Graphics()
    .poly([0, -28, 16, 18, 0, 12, -16, 18])
    .fill(0xf4d35e);

  readonly collisionRadius = GAME_CONFIG.player.collisionRadius;
  readonly movementSpeed = GAME_CONFIG.player.movementSpeed;
  readonly rotationSpeed = GAME_CONFIG.player.rotationSpeed;

  reset(x: number, y: number) {
    this.graphic.position.set(x, y);
    this.graphic.rotation = 0;
  }
}
