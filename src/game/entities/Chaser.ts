import { Assets, Container, Sprite, Texture } from "pixi.js";
import { GAME_CONFIG } from "../config/gameConfig";
import shipImage from "../../assets/ship_3.png";

export class Chaser {
  graphic = new Container();
  readonly ready: Promise<void>;

  readonly collisionRadius = GAME_CONFIG.chaser.collisionRadius;
  readonly movementSpeed = GAME_CONFIG.chaser.movementSpeed;
  readonly maxHealth = GAME_CONFIG.chaser.maxHealth;
  health = this.maxHealth;
  active = true;
  private texture: Texture | null = null;

  constructor() {
    this.ready = this.loadSprite();
  }

  reset(x: number, y: number) {
    if (!this.active) {
      this.graphic = this.createGraphic();
    }

    this.graphic.position.set(x, y);
    this.health = this.maxHealth;
    this.active = true;
  }

  private async loadSprite(): Promise<void> {
    this.texture = await Assets.load<Texture>(shipImage);
    this.graphic.addChild(this.createSprite(this.texture));
  }

  private createGraphic() {
    const graphic = new Container();
    if (this.texture) graphic.addChild(this.createSprite(this.texture));
    return graphic;
  }

  private createSprite(texture: Texture) {
    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5);
    sprite.scale.set(0.32);
    sprite.rotation = Math.PI;
    return sprite;
  }
}
