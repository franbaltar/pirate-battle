import { Assets, Container, Sprite, Texture } from "pixi.js";
import { GAME_CONFIG } from "../config/gameConfig";
import shipImage from "../../assets/ship_2.png";

export class Shooter {
  graphic = new Container();
  readonly ready: Promise<void>;

  readonly collisionRadius = GAME_CONFIG.shooter.radius;
  readonly movementSpeed = GAME_CONFIG.shooter.speed;
  readonly projectileSpeed = GAME_CONFIG.shooter.projectileSpeed;
  readonly projectileRadius = GAME_CONFIG.shooter.projectileRadius;
  readonly fireInterval = GAME_CONFIG.shooter.fireInterval;
  active = true;
  private texture: Texture | null = null;

  constructor() {
    this.ready = this.loadSprite();
  }

  reset(x: number, y: number) {
    this.graphic.position.set(x, y);
    this.active = true;
  }

  private async loadSprite(): Promise<void> {
    this.texture = await Assets.load<Texture>(shipImage);
    this.graphic.addChild(this.createSprite(this.texture));
  }

  private createSprite(texture: Texture) {
    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5);
    sprite.scale.set(0.32);
    sprite.rotation = Math.PI;
    return sprite;
  }
}
