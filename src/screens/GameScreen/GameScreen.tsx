import { Application, Graphics, Text } from "pixi.js";
import { useEffect, useRef } from "react";

type Island = {
  x: number;
  y: number;
  radius: number;
  graphic: Graphics;
};

type Projectile = {
  graphic: Graphics;
  directionX: number;
  directionY: number;
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

      const chaserRadius = 18;
      const chaser = new Graphics().circle(0, 0, chaserRadius).fill(0xe5484d);
      chaser.position.set(
        Math.max(chaserRadius, Math.min(48, app.screen.width - chaserRadius)),
        Math.max(chaserRadius, Math.min(48, app.screen.height - chaserRadius)),
      );
      app.stage.addChild(chaser);
      let chaserHealth = 3;
      let chaserIsActive = true;

      const shooterRadius = 18;
      const shooterSpeed = 1.2;
      const shooter = new Graphics().circle(0, 0, shooterRadius).fill(0x9b59b6);
      const shooterPositions = [
        { x: app.screen.width - shooterRadius, y: shooterRadius },
        {
          x: app.screen.width - shooterRadius,
          y: app.screen.height - shooterRadius,
        },
        { x: shooterRadius, y: shooterRadius },
        { x: shooterRadius, y: app.screen.height - shooterRadius },
      ];
      const isClearOfIslands = (position: { x: number; y: number }) =>
        islands.every(
          (island) =>
            Math.hypot(position.x - island.x, position.y - island.y) >=
            shooterRadius + island.radius,
        );
      const shooterPosition =
        shooterPositions.find(
          (position) =>
            Math.hypot(position.x - ship.x, position.y - ship.y) > 250 &&
            isClearOfIslands(position),
        ) ??
        shooterPositions.find(isClearOfIslands) ??
        shooterPositions[0];
      shooter.position.set(shooterPosition.x, shooterPosition.y);
      app.stage.addChild(shooter);
      let shooterIsActive = true;
      const shooterProjectiles: Projectile[] = [];
      const shooterProjectileRadius = 4;
      const shooterProjectileSpeed = 5;
      const shooterFireInterval = 90;
      let shooterFireCooldown = shooterFireInterval;
      const fireShooterProjectile = () => {
        const directionX = ship.x - shooter.x;
        const directionY = ship.y - shooter.y;
        const distanceToShip = Math.hypot(directionX, directionY);
        if (distanceToShip === 0) return;

        const graphic = new Graphics()
          .circle(0, 0, shooterProjectileRadius)
          .fill(0xd8b4e2);
        graphic.position.set(shooter.x, shooter.y);
        app.stage.addChild(graphic);
        shooterProjectiles.push({
          graphic,
          directionX: directionX / distanceToShip,
          directionY: directionY / distanceToShip,
        });
      };

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
      const projectiles: Projectile[] = [];
      const projectileRadius = 4;
      const projectileSpeed = 8;
      const projectileCooldown = 15;
      let shootCooldown = 0;
      const fireProjectile = () => {
        const directionX = Math.sin(ship.rotation);
        const directionY = -Math.cos(ship.rotation);
        const graphic = new Graphics()
          .circle(0, 0, projectileRadius)
          .fill(0xffffff);
        graphic.position.set(
          ship.x + directionX * 30,
          ship.y + directionY * 30,
        );
        app.stage.addChild(graphic);
        projectiles.push({ graphic, directionX, directionY });
      };
      const handleKeyDown = (event: KeyboardEvent) => {
        if (isGameOver) return;

        if (event.code === "Space") {
          event.preventDefault();
          if (shootCooldown <= 0) {
            fireProjectile();
            shootCooldown = projectileCooldown;
          }
          return;
        }

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
      let playerHealth = 3;
      let isGameOver = false;
      let remainingTime = 30;
      let elapsedTickerFrames = 0;
      const playerHealthText = new Text({
        text: `HP: ${playerHealth}`,
        style: { fill: 0xffffff, fontSize: 20 },
      });
      playerHealthText.position.set(20, 20);
      app.stage.addChild(playerHealthText);
      let playerScore = 0;
      const playerScoreText = new Text({
        text: `Score: ${playerScore}`,
        style: { fill: 0xffffff, fontSize: 20 },
      });
      playerScoreText.position.set(20, 50);
      app.stage.addChild(playerScoreText);
      const timerText = new Text({
        text: `Time: ${remainingTime}`,
        style: { fill: 0xffffff, fontSize: 20 },
      });
      timerText.position.set(20, 80);
      app.stage.addChild(timerText);
      const gameOverText = new Text({
        text: "GAME OVER",
        style: { fill: 0xffffff, fontSize: 56, fontWeight: "bold" },
      });
      gameOverText.anchor.set(0.5);
      gameOverText.position.set(app.screen.width / 2, app.screen.height / 2);
      gameOverText.visible = false;
      app.stage.addChild(gameOverText);
      const chaserSpeed = 1.5;
      const updateShip = (ticker: { deltaTime: number }) => {
        if (isGameOver) return;

        elapsedTickerFrames += ticker.deltaTime;
        while (elapsedTickerFrames >= 60 && remainingTime > 0) {
          elapsedTickerFrames -= 60;
          remainingTime = Math.max(0, remainingTime - 1);
          timerText.text = `Time: ${remainingTime}`;

          if (remainingTime === 0) {
            isGameOver = true;
            gameOverText.visible = true;
            return;
          }
        }

        shootCooldown = Math.max(0, shootCooldown - ticker.deltaTime);

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

        if (chaserIsActive) {
          const directionX = ship.x - chaser.x;
          const directionY = ship.y - chaser.y;
          const distanceToShip = Math.hypot(directionX, directionY);

          if (distanceToShip > 0) {
            const movementDistance = chaserSpeed * ticker.deltaTime;
            const nextChaserX = Math.max(
              chaserRadius,
              Math.min(
                app.screen.width - chaserRadius,
                chaser.x + (directionX / distanceToShip) * movementDistance,
              ),
            );
            const nextChaserY = Math.max(
              chaserRadius,
              Math.min(
                app.screen.height - chaserRadius,
                chaser.y + (directionY / distanceToShip) * movementDistance,
              ),
            );
            const chaserCollidesWithIsland = islands.some(
              (island) =>
                Math.hypot(nextChaserX - island.x, nextChaserY - island.y) <
                chaserRadius + island.radius,
            );

            if (!chaserCollidesWithIsland) {
              chaser.x = nextChaserX;
              chaser.y = nextChaserY;
            }
          }
        }

        if (shooterIsActive) {
          shooterFireCooldown = Math.max(
            0,
            shooterFireCooldown - ticker.deltaTime,
          );

          const directionX = ship.x - shooter.x;
          const directionY = ship.y - shooter.y;
          const distanceToShip = Math.hypot(directionX, directionY);

          if (distanceToShip > 250) {
            const movementDistance = Math.min(
              shooterSpeed * ticker.deltaTime,
              distanceToShip - 250,
            );
            const nextShooterX = Math.max(
              shooterRadius,
              Math.min(
                app.screen.width - shooterRadius,
                shooter.x + (directionX / distanceToShip) * movementDistance,
              ),
            );
            const nextShooterY = Math.max(
              shooterRadius,
              Math.min(
                app.screen.height - shooterRadius,
                shooter.y + (directionY / distanceToShip) * movementDistance,
              ),
            );
            const shooterCollidesWithIsland = islands.some(
              (island) =>
                Math.hypot(nextShooterX - island.x, nextShooterY - island.y) <
                shooterRadius + island.radius,
            );

            if (!shooterCollidesWithIsland) {
              shooter.x = nextShooterX;
              shooter.y = nextShooterY;
            }
          }

          if (shooterFireCooldown === 0) {
            fireShooterProjectile();
            shooterFireCooldown = shooterFireInterval;
          }
        }

        for (let index = projectiles.length - 1; index >= 0; index--) {
          const projectile = projectiles[index];
          projectile.graphic.x +=
            projectile.directionX * projectileSpeed * ticker.deltaTime;
          projectile.graphic.y +=
            projectile.directionY * projectileSpeed * ticker.deltaTime;

          const collidesWithIsland = islands.some(
            (island) =>
              Math.hypot(
                projectile.graphic.x - island.x,
                projectile.graphic.y - island.y,
              ) <
              projectileRadius + island.radius,
          );
          const collidesWithChaser =
            chaserIsActive &&
            Math.hypot(
              projectile.graphic.x - chaser.x,
              projectile.graphic.y - chaser.y,
            ) <
              projectileRadius + chaserRadius;

          if (collidesWithChaser) {
            chaserHealth -= 1;
            if (chaserHealth === 0) {
              chaserIsActive = false;
              app.stage.removeChild(chaser);
              chaser.destroy();
              playerScore += 100;
              playerScoreText.text = `Score: ${playerScore}`;
            }
          }

          if (
            collidesWithIsland ||
            collidesWithChaser ||
            projectile.graphic.x < 0 ||
            projectile.graphic.x > app.screen.width ||
            projectile.graphic.y < 0 ||
            projectile.graphic.y > app.screen.height
          ) {
            app.stage.removeChild(projectile.graphic);
            projectile.graphic.destroy();
            projectiles.splice(index, 1);
          }
        }

        for (let index = shooterProjectiles.length - 1; index >= 0; index--) {
          const projectile = shooterProjectiles[index];
          projectile.graphic.x +=
            projectile.directionX * shooterProjectileSpeed * ticker.deltaTime;
          projectile.graphic.y +=
            projectile.directionY * shooterProjectileSpeed * ticker.deltaTime;

          const collidesWithIsland = islands.some(
            (island) =>
              Math.hypot(
                projectile.graphic.x - island.x,
                projectile.graphic.y - island.y,
              ) <
              shooterProjectileRadius + island.radius,
          );
          const collidesWithPlayer =
            Math.hypot(
              projectile.graphic.x - ship.x,
              projectile.graphic.y - ship.y,
            ) <
            shooterProjectileRadius + shipCollisionRadius;
          const isOutsideScreen =
            projectile.graphic.x < 0 ||
            projectile.graphic.x > app.screen.width ||
            projectile.graphic.y < 0 ||
            projectile.graphic.y > app.screen.height;

          if (collidesWithPlayer) {
            playerHealth = Math.max(0, playerHealth - 1);
            playerHealthText.text = `HP: ${playerHealth}`;

            if (playerHealth === 0) {
              isGameOver = true;
              gameOverText.position.set(
                app.screen.width / 2,
                app.screen.height / 2,
              );
              gameOverText.visible = true;
            }
          }

          if (collidesWithIsland || collidesWithPlayer || isOutsideScreen) {
            app.stage.removeChild(projectile.graphic);
            projectile.graphic.destroy();
            shooterProjectiles.splice(index, 1);
          }
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
