import { Assets, Container, Sprite } from "pixi.js";
import { GAME_CONFIG } from "../config/gameConfig";
import flagImage from "../../assets/flag_1.png";
import hullImage from "../../assets/hull_large_1.png";
import sailImage from "../../assets/sail_large_1.png";

export class Player {
  readonly graphic = new Container();
  readonly ready: Promise<void>;

  readonly collisionRadius = GAME_CONFIG.player.collisionRadius;
  readonly movementSpeed = GAME_CONFIG.player.movementSpeed;
  readonly rotationSpeed = GAME_CONFIG.player.rotationSpeed;

  constructor() {
    this.ready = this.loadSprites();
  }

  private async loadSprites() {
    const [hullTexture, sailTexture, flagTexture] = await Promise.all([
      Assets.load(hullImage),
      Assets.load(sailImage),
      Assets.load(flagImage),
    ]);

    const hull = new Sprite(hullTexture);
    hull.anchor.set(0.5);
    hull.scale.set(0.42);
    hull.rotation = Math.PI;

    const sail = new Sprite(sailTexture);
    sail.anchor.set(0.5);
    sail.scale.set(0.34);
    sail.position.set(0, -4);

    const flag = new Sprite(flagTexture);
    flag.anchor.set(0.5);
    flag.scale.set(0.42);
    flag.position.set(0, -19);

    this.graphic.addChild(hull, sail, flag);
  }

  reset(x: number, y: number) {
    this.graphic.position.set(x, y);
    this.graphic.rotation = 0;
  }
}
