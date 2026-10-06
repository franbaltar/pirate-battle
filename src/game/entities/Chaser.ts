import { Graphics } from "pixi.js";

export class Chaser {
	readonly collisionRadius = 18;
	readonly movementSpeed = 1.5;
	readonly maxHealth = 3;
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
