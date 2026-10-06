import { Graphics } from "pixi.js";
import { GAME_CONFIG } from "../config/gameConfig";

export class Shooter {
  readonly collisionRadius = GAME_CONFIG.shooter.radius;
  readonly movementSpeed = GAME_CONFIG.shooter.speed;
  readonly projectileSpeed = GAME_CONFIG.shooter.projectileSpeed;
  readonly projectileRadius = GAME_CONFIG.shooter.projectileRadius;
  readonly fireInterval = GAME_CONFIG.shooter.fireInterval;
  active = true;
  readonly graphic = new Graphics()
    .circle(0, 0, this.collisionRadius)
    .fill(0x9b59b6);

  reset(x: number, y: number) {
    this.graphic.position.set(x, y);
    this.active = true;
  }
}
