import { Application } from "pixi.js";
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
