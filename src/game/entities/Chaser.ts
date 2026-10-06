import { Graphics } from "pixi.js";
import { GAME_CONFIG } from "../config/gameConfig";

export class Chaser {
  readonly collisionRadius = GAME_CONFIG.chaser.collisionRadius;
  readonly movementSpeed = GAME_CONFIG.chaser.movementSpeed;
  readonly maxHealth = GAME_CONFIG.chaser.maxHealth;
  health = this.maxHealth;
  active = true;
  graphic = this.createGraphic();

  reset(x: number, y: number) {
    if (!this.active) {
      this.graphic = this.createGraphic();
    }

    this.graphic.position.set(x, y);
    this.health = this.maxHealth;
    this.active = true;
  }

  private createGraphic() {
    return new Graphics().circle(0, 0, this.collisionRadius).fill(0xe5484d);
  }
}
