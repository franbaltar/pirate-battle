import {
  Application,
  Assets,
  Container,
  Graphics,
  Sprite,
  Text,
  TilingSprite,
} from "pixi.js";
import { useEffect, useRef } from "react";
import tile1Image from "../../assets/game/tile_1.png";
import tile2Image from "../../assets/game/tile_2.png";
import tile3Image from "../../assets/game/tile_3.png";
import tile4Image from "../../assets/game/tile_4.png";
import tile5Image from "../../assets/game/tile_5.png";
import tile6Image from "../../assets/game/tile_6.png";
import tile7Image from "../../assets/game/tile_7.png";
import tile8Image from "../../assets/game/tile_8.png";
import tile9Image from "../../assets/game/tile_9.png";
import tile10Image from "../../assets/game/tile_10.png";
import tile11Image from "../../assets/game/tile_11.png";
import tile12Image from "../../assets/game/tile_12.png";
import waterTileImage from "../../assets/game/tile_73.png";
import { GAME_CONFIG } from "../../game/config/gameConfig";
import { Chaser } from "../../game/entities/Chaser";
import { Player } from "../../game/entities/Player";
import { Shooter } from "../../game/entities/Shooter";

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

type GameScreenProps = {
  duration: number;
  spawnRate: "low" | "normal" | "high";
  onGameOver: (score: number) => void;
};

export default function GameScreen({
  duration,
  spawnRate,
  onGameOver,
}: GameScreenProps) {
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

      const waterTexture = await Assets.load(waterTileImage);
      const islandTileTextures = await Promise.all(
        [
          tile1Image,
          tile2Image,
          tile3Image,
          tile4Image,
          tile5Image,
          tile6Image,
          tile7Image,
          tile8Image,
          tile9Image,
          tile10Image,
          tile11Image,
          tile12Image,
        ].map((image) => Assets.load(image)),
      );
      const oceanBackground = new TilingSprite({
        texture: waterTexture,
        width: app.screen.width,
        height: app.screen.height,
      });
      app.stage.addChild(oceanBackground);

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
        const islandVisual = new Container();
        const tileSize = islandTileTextures[0].width;
        islandTileTextures.forEach((texture, index) => {
          const tile = new Sprite(texture);
          tile.position.set(
            (index % 4) * tileSize - tileSize * 2,
            Math.floor(index / 4) * tileSize - tileSize * 1.5,
          );
          islandVisual.addChild(tile);
        });
        islandVisual.scale.set((island.radius * 2) / (tileSize * 4));

        island.graphic.position.set(island.x, island.y);
        island.graphic.addChild(islandVisual);
        app.stage.addChild(island.graphic);
      }

      const player = new Player();
      player.reset(app.screen.width / 2, app.screen.height / 2);
      await player.ready;
      app.stage.addChild(player.graphic);

      const chaser = new Chaser();
      const chaserRespawnInterval = GAME_CONFIG.spawnRate[spawnRate];
      let chaserRespawnCooldown = 0;
      const initialChaserPosition = {
        x: Math.max(
          chaser.collisionRadius,
          Math.min(48, app.screen.width - chaser.collisionRadius),
        ),
        y: Math.max(
          chaser.collisionRadius,
          Math.min(48, app.screen.height - chaser.collisionRadius),
        ),
      };
      chaser.reset(initialChaserPosition.x, initialChaserPosition.y);
      await chaser.ready;
      app.stage.addChild(chaser.graphic);

      const shooter = new Shooter();
      const shooterPositions = [
        {
          x: app.screen.width - shooter.collisionRadius,
          y: shooter.collisionRadius,
        },
        {
          x: app.screen.width - shooter.collisionRadius,
          y: app.screen.height - shooter.collisionRadius,
        },
        { x: shooter.collisionRadius, y: shooter.collisionRadius },
        {
          x: shooter.collisionRadius,
          y: app.screen.height - shooter.collisionRadius,
        },
      ];
      const isClearOfIslands = (position: { x: number; y: number }) =>
        islands.every(
          (island) =>
            Math.hypot(position.x - island.x, position.y - island.y) >=
            shooter.collisionRadius + island.radius,
        );
      const shooterPosition =
        shooterPositions.find(
          (position) =>
            Math.hypot(
              position.x - player.graphic.x,
              position.y - player.graphic.y,
            ) > 250 && isClearOfIslands(position),
        ) ??
        shooterPositions.find(isClearOfIslands) ??
        shooterPositions[0];
      shooter.reset(shooterPosition.x, shooterPosition.y);
      await shooter.ready;
      app.stage.addChild(shooter.graphic);
      const shooterProjectiles: Projectile[] = [];
      let shooterFireCooldown: number = shooter.fireInterval;
      const fireShooterProjectile = () => {
        const directionX = player.graphic.x - shooter.graphic.x;
        const directionY = player.graphic.y - shooter.graphic.y;
        const distanceToShip = Math.hypot(directionX, directionY);
        if (distanceToShip === 0) return;

        const graphic = new Graphics()
          .circle(0, 0, shooter.projectileRadius)
          .fill(0xd8b4e2);
        graphic.position.set(shooter.graphic.x, shooter.graphic.y);
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
      const projectileRadius = GAME_CONFIG.projectile.radius;
      const projectileSpeed = GAME_CONFIG.projectile.speed;
      const projectileCooldown = GAME_CONFIG.projectile.cooldown;
      const sideShotCooldown = GAME_CONFIG.projectile.sideShotCooldown;
      let shootCooldown = 0;
      let sideShootCooldown = 0;
      const fireProjectile = () => {
        const directionX = Math.sin(player.graphic.rotation);
        const directionY = -Math.cos(player.graphic.rotation);
        const graphic = new Graphics()
          .circle(0, 0, projectileRadius)
          .fill(0xffffff);
        graphic.position.set(
          player.graphic.x + directionX * 30,
          player.graphic.y + directionY * 30,
        );
        app.stage.addChild(graphic);
        projectiles.push({ graphic, directionX, directionY });
      };
      const fireSideShot = () => {
        const spread = GAME_CONFIG.projectile.sideShotSpread;
        const angleOffsets = [-spread, 0, spread];

        for (const angleOffset of angleOffsets) {
          const direction = player.graphic.rotation + angleOffset;
          const directionX = Math.sin(direction);
          const directionY = -Math.cos(direction);
          const graphic = new Graphics()
            .circle(0, 0, projectileRadius)
            .fill(0xffffff);
          graphic.position.set(
            player.graphic.x + directionX * 30,
            player.graphic.y + directionY * 30,
          );
          app.stage.addChild(graphic);
          projectiles.push({ graphic, directionX, directionY });
        }
      };
      const handleKeyDown = (event: KeyboardEvent) => {
        if (isGameOver) {
          if (event.key.toLowerCase() === "r") {
            event.preventDefault();
            restartGame();
          }
          return;
        }

        if (event.key.toLowerCase() === "p") {
          event.preventDefault();
          isPaused = !isPaused;
          pausedText.visible = isPaused;
          return;
        }

        if (event.code === "Space") {
          event.preventDefault();
          if (!isPaused && shootCooldown <= 0) {
            fireProjectile();
            shootCooldown = projectileCooldown;
          }
          return;
        }

        if (event.key === "Shift") {
          event.preventDefault();
          if (!isPaused && sideShootCooldown <= 0) {
            fireSideShot();
            sideShootCooldown = sideShotCooldown;
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
      let playerHealth: number = GAME_CONFIG.player.maxHealth;
      let isGameOver = false;
      let isPaused = false;
      let remainingTime: number = duration;
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
      const pausedText = new Text({
        text: "PAUSED",
        style: { fill: 0xffffff, fontSize: 56, fontWeight: "bold" },
      });
      pausedText.anchor.set(0.5);
      pausedText.position.set(app.screen.width / 2, app.screen.height / 2);
      pausedText.visible = false;
      app.stage.addChild(pausedText);
      const clearProjectiles = (activeProjectiles: Projectile[]) => {
        for (const projectile of activeProjectiles) {
          app.stage.removeChild(projectile.graphic);
          projectile.graphic.destroy();
        }
        activeProjectiles.length = 0;
      };
      const restartGame = () => {
        clearProjectiles(projectiles);
        clearProjectiles(shooterProjectiles);
        pressedKeys.clear();

        playerHealth = GAME_CONFIG.player.maxHealth;
        playerHealthText.text = `HP: ${playerHealth}`;
        playerScore = 0;
        playerScoreText.text = `Score: ${playerScore}`;
        remainingTime = duration;
        elapsedTickerFrames = 0;
        timerText.text = `Time: ${remainingTime}`;
        shootCooldown = 0;
        sideShootCooldown = 0;
        shooterFireCooldown = shooter.fireInterval;

        player.reset(app.screen.width / 2, app.screen.height / 2);

        const chaserWasInactive = !chaser.active;
        chaser.reset(initialChaserPosition.x, initialChaserPosition.y);
        if (chaserWasInactive) app.stage.addChild(chaser.graphic);

        shooter.reset(shooterPosition.x, shooterPosition.y);

        gameOverText.position.set(app.screen.width / 2, app.screen.height / 2);
        gameOverText.visible = false;
        isGameOver = false;
      };
      const updateShip = (ticker: { deltaTime: number }) => {
        if (isGameOver || isPaused) return;

        elapsedTickerFrames += ticker.deltaTime;
        while (elapsedTickerFrames >= 60 && remainingTime > 0) {
          elapsedTickerFrames -= 60;
          remainingTime = Math.max(0, remainingTime - 1);
          timerText.text = `Time: ${remainingTime}`;

          if (remainingTime === 0) {
            if (!isGameOver) {
              isGameOver = true;
              onGameOver(playerScore);
            }
            gameOverText.visible = true;
            return;
          }
        }

        shootCooldown = Math.max(0, shootCooldown - ticker.deltaTime);
        sideShootCooldown = Math.max(0, sideShootCooldown - ticker.deltaTime);

        const turnDirection =
          Number(pressedKeys.has("d") || pressedKeys.has("arrowright")) -
          Number(pressedKeys.has("a") || pressedKeys.has("arrowleft"));
        const thrustDirection =
          Number(pressedKeys.has("w") || pressedKeys.has("arrowup")) -
          Number(pressedKeys.has("s") || pressedKeys.has("arrowdown"));

        player.graphic.rotation +=
          turnDirection * player.rotationSpeed * ticker.deltaTime;

        const movementDistance =
          thrustDirection * player.movementSpeed * ticker.deltaTime;
        const nextX = Math.max(
          16,
          Math.min(
            app.screen.width - 16,
            player.graphic.x +
              Math.sin(player.graphic.rotation) * movementDistance,
          ),
        );
        const nextY = Math.max(
          28,
          Math.min(
            app.screen.height - 18,
            player.graphic.y -
              Math.cos(player.graphic.rotation) * movementDistance,
          ),
        );
        const collidesWithIsland = islands.some(
          (island) =>
            Math.hypot(nextX - island.x, nextY - island.y) <
            player.collisionRadius + island.radius,
        );

        if (!collidesWithIsland) {
          player.graphic.x = nextX;
          player.graphic.y = nextY;
        }

        if (chaser.active) {
          const directionX = player.graphic.x - chaser.graphic.x;
          const directionY = player.graphic.y - chaser.graphic.y;
          const distanceToShip = Math.hypot(directionX, directionY);

          if (distanceToShip > 0) {
            const movementDistance = chaser.movementSpeed * ticker.deltaTime;
            const nextChaserX = Math.max(
              chaser.collisionRadius,
              Math.min(
                app.screen.width - chaser.collisionRadius,
                chaser.graphic.x +
                  (directionX / distanceToShip) * movementDistance,
              ),
            );
            const nextChaserY = Math.max(
              chaser.collisionRadius,
              Math.min(
                app.screen.height - chaser.collisionRadius,
                chaser.graphic.y +
                  (directionY / distanceToShip) * movementDistance,
              ),
            );
            const chaserCollidesWithIsland = islands.some(
              (island) =>
                Math.hypot(nextChaserX - island.x, nextChaserY - island.y) <
                chaser.collisionRadius + island.radius,
            );

            if (!chaserCollidesWithIsland) {
              chaser.graphic.x = nextChaserX;
              chaser.graphic.y = nextChaserY;
            }
          }
        } else {
          chaserRespawnCooldown = Math.max(
            0,
            chaserRespawnCooldown - ticker.deltaTime,
          );

          if (chaserRespawnCooldown === 0) {
            chaser.reset(initialChaserPosition.x, initialChaserPosition.y);
            app.stage.addChild(chaser.graphic);
          }
        }

        if (shooter.active) {
          shooterFireCooldown = Math.max(
            0,
            shooterFireCooldown - ticker.deltaTime,
          );

          const directionX = player.graphic.x - shooter.graphic.x;
          const directionY = player.graphic.y - shooter.graphic.y;
          const distanceToShip = Math.hypot(directionX, directionY);

          if (distanceToShip > 250) {
            const movementDistance = Math.min(
              shooter.movementSpeed * ticker.deltaTime,
              distanceToShip - 250,
            );
            const nextShooterX = Math.max(
              shooter.collisionRadius,
              Math.min(
                app.screen.width - shooter.collisionRadius,
                shooter.graphic.x +
                  (directionX / distanceToShip) * movementDistance,
              ),
            );
            const nextShooterY = Math.max(
              shooter.collisionRadius,
              Math.min(
                app.screen.height - shooter.collisionRadius,
                shooter.graphic.y +
                  (directionY / distanceToShip) * movementDistance,
              ),
            );
            const shooterCollidesWithIsland = islands.some(
              (island) =>
                Math.hypot(nextShooterX - island.x, nextShooterY - island.y) <
                shooter.collisionRadius + island.radius,
            );

            if (!shooterCollidesWithIsland) {
              shooter.graphic.x = nextShooterX;
              shooter.graphic.y = nextShooterY;
            }
          }

          if (shooterFireCooldown === 0) {
            fireShooterProjectile();
            shooterFireCooldown = shooter.fireInterval;
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
            chaser.active &&
            Math.hypot(
              projectile.graphic.x - chaser.graphic.x,
              projectile.graphic.y - chaser.graphic.y,
            ) <
              projectileRadius + chaser.collisionRadius;

          if (collidesWithChaser) {
            chaser.health -= 1;
            if (chaser.health === 0) {
              chaser.active = false;
              app.stage.removeChild(chaser.graphic);
              chaser.graphic.destroy();
              playerScore += GAME_CONFIG.chaser.score;
              playerScoreText.text = `Score: ${playerScore}`;
              chaserRespawnCooldown = chaserRespawnInterval;
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
            projectile.directionX * shooter.projectileSpeed * ticker.deltaTime;
          projectile.graphic.y +=
            projectile.directionY * shooter.projectileSpeed * ticker.deltaTime;

          const collidesWithIsland = islands.some(
            (island) =>
              Math.hypot(
                projectile.graphic.x - island.x,
                projectile.graphic.y - island.y,
              ) <
              shooter.projectileRadius + island.radius,
          );
          const collidesWithPlayer =
            Math.hypot(
              projectile.graphic.x - player.graphic.x,
              projectile.graphic.y - player.graphic.y,
            ) <
            shooter.projectileRadius + player.collisionRadius;
          const isOutsideScreen =
            projectile.graphic.x < 0 ||
            projectile.graphic.x > app.screen.width ||
            projectile.graphic.y < 0 ||
            projectile.graphic.y > app.screen.height;

          if (collidesWithPlayer) {
            playerHealth = Math.max(0, playerHealth - 1);
            playerHealthText.text = `HP: ${playerHealth}`;

            if (playerHealth === 0) {
              if (!isGameOver) {
                isGameOver = true;
                onGameOver(playerScore);
              }
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
