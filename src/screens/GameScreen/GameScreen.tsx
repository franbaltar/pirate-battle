import { Application, Graphics } from "pixi.js";
import { useEffect, useRef } from "react";

export default function GameScreen() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const app = new Application();
    let isUnmounted = false;
    let isInitialized = false;

    const initialize = async () => {
      await app.init({ resizeTo: container });
      isInitialized = true;

      app.renderer.background.color = 0x0b2d4a;

      const islands = [
        { x: app.screen.width * 0.25, y: app.screen.height * 0.3, radius: 64 },
        { x: app.screen.width * 0.7, y: app.screen.height * 0.4, radius: 82 },
        { x: app.screen.width * 0.45, y: app.screen.height * 0.75, radius: 55 },
      ];

      for (const island of islands) {
        const graphic = new Graphics()
          .circle(0, 0, island.radius)
          .fill(0xc2a46b)
          .circle(0, 0, island.radius * 0.72)
          .fill(0x426b4a);
        graphic.position.set(island.x, island.y);
        app.stage.addChild(graphic);
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
    };

    void initialize();

    return () => {
      isUnmounted = true;
      if (isInitialized) app.destroy({ removeView: true });
    };
  }, []);

  return (
    <main ref={containerRef} style={{ width: "100vw", height: "100vh" }} />
  );
}
