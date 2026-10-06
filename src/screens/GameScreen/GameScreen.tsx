import { Application, Graphics } from "pixi.js";
import { useEffect, useRef } from "react";

type Island = {
  x: number;
  y: number;
  radius: number;
  graphic: Graphics;
};

export default function GameScreen() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const app = new Application();
    let isUnmounted = false;
    let isInitialized = false;
    let cleanupMovement = () => {};

    const initialize = async () => {
      await app.init({ resizeTo: container });
      isInitialized = true;

      app.renderer.background.color = 0x0b2d4a;

      const islands: Island[] = [
        {
          x: app.screen.width * 0.25,
          y: app.screen.height * 0.3,
          radius: 64,
          graphic: new Graphics(),
        },
        {
          x: app.screen.width * 0.7,
          y: app.screen.height * 0.4,
          radius: 82,
          graphic: new Graphics(),
        },
        {
          x: app.screen.width * 0.45,
          y: app.screen.height * 0.75,
          radius: 55,
          graphic: new Graphics(),
        },
      ];

      for (const island of islands) {
        island.graphic
          .circle(0, 0, island.radius)
          .fill(0xc2a46b)
          .circle(0, 0, island.radius * 0.72)
          .fill(0x426b4a);
        island.graphic.position.set(island.x, island.y);
        app.stage.addChild(island.graphic);
      }

      const ship = new Graphics()
        .poly([0, -28, 16, 18, 0, 12, -16, 18])
        .fill(0xf4d35e);
      ship.position.set(app.screen.width / 2, app.screen.height / 2);
      app.stage.addChild(ship);

      if (isUnmounted) {
        app.destroy({ removeView: true });
        return;
      }

      container.appendChild(app.canvas);

      const pressedKeys = new Set<string>();
      const movementKeys = new Set([
        "w",
        "a",
        "s",
        "d",
        "arrowup",
        "arrowdown",
        "arrowleft",
        "arrowright",
      ]);
      const handleKeyDown = (event: KeyboardEvent) => {
        const key = event.key.toLowerCase();
        if (movementKeys.has(key)) {
          event.preventDefault();
          pressedKeys.add(key);
        }
      };
      const handleKeyUp = (event: KeyboardEvent) => {
        pressedKeys.delete(event.key.toLowerCase());
      };
      const movementSpeed = 4;
      const rotationSpeed = 0.05;
      const shipCollisionRadius = 20;
      const updateShip = (ticker: { deltaTime: number }) => {
        const turnDirection =
          Number(pressedKeys.has("d") || pressedKeys.has("arrowright")) -
          Number(pressedKeys.has("a") || pressedKeys.has("arrowleft"));
        const thrustDirection =
          Number(pressedKeys.has("w") || pressedKeys.has("arrowup")) -
          Number(pressedKeys.has("s") || pressedKeys.has("arrowdown"));

        ship.rotation += turnDirection * rotationSpeed * ticker.deltaTime;

        const movementDistance =
          thrustDirection * movementSpeed * ticker.deltaTime;
        const nextX = Math.max(
          16,
          Math.min(
            app.screen.width - 16,
            ship.x + Math.sin(ship.rotation) * movementDistance,
          ),
        );
        const nextY = Math.max(
          28,
          Math.min(
            app.screen.height - 18,
            ship.y - Math.cos(ship.rotation) * movementDistance,
          ),
        );
        const collidesWithIsland = islands.some(
          (island) =>
            Math.hypot(nextX - island.x, nextY - island.y) <
            shipCollisionRadius + island.radius,
        );

        if (!collidesWithIsland) {
          ship.x = nextX;
          ship.y = nextY;
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
      app.ticker.add(updateShip);
      cleanupMovement = () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
        app.ticker.remove(updateShip);
        pressedKeys.clear();
      };
    };

    void initialize();

    return () => {
      isUnmounted = true;
      cleanupMovement();
      if (isInitialized) app.destroy({ removeView: true });
    };
  }, []);

  return (
    <main ref={containerRef} style={{ width: "100vw", height: "100vh" }} />
  );
}
