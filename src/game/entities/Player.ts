import { Graphics } from "pixi.js";

export class Player {
  readonly graphic = new Graphics()
    .poly([0, -28, 16, 18, 0, 12, -16, 18])
    .fill(0xf4d35e);

  readonly collisionRadius = 20;
  readonly movementSpeed = 4;
  readonly rotationSpeed = 0.05;

  reset(x: number, y: number) {
    this.graphic.position.set(x, y);
    this.graphic.rotation = 0;
  }
}
