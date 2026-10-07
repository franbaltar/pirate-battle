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
import cannonBallImage from "../../assets/game/cannon_ball.png";
import fireImage from "../../assets/game/fire_2.png";
import damageEffectImage from "../../assets/game/explosion_3.png";
import deathExplosionImage from "../../assets/game/explosion_1.png";
import counterPanelImage from "../../assets/hud/counter_panel.png";
import heartIconImage from "../../assets/hud/icon_heart.png";
import scoreIconImage from "../../assets/hud/icon_score.png";
import timeIconImage from "../../assets/hud/icon_time.png";
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
  graphic: Sprite;
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
      app.stage.sortableChildren = true;

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
      const [counterPanelTexture, heartTexture, scoreTexture, timeTexture] =
        await Promise.all([
          Assets.load(counterPanelImage),
          Assets.load(heartIconImage),
          Assets.load(scoreIconImage),
          Assets.load(timeIconImage),
        ]);
      const [
        cannonBallTexture,
        fireTexture,
        damageEffectTexture,
        deathExplosionTexture,
      ] = await Promise.all([
        Assets.load(cannonBallImage),
        Assets.load(fireImage),
        Assets.load(damageEffectImage),
        Assets.load(deathExplosionImage),
      ]);
      const oceanBackground = new TilingSprite({
        texture: waterTexture,
        width: app.screen.width,
        height: app.screen.height,
      });
      oceanBackground.zIndex = -10;
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
      const shooterSprite = shooter.graphic.children[0] as Sprite;
      const shooterTexture = shooterSprite.texture;
      const shooterSpriteScale = shooterSprite.scale.clone();
      const shooterSpriteRotation = shooterSprite.rotation;
      const createShooterGraphic = () => {
        const graphic = new Container();
        const sprite = new Sprite(shooterTexture);
        sprite.anchor.set(0.5);
        sprite.scale.copyFrom(shooterSpriteScale);
        sprite.rotation = shooterSpriteRotation;
        graphic.addChild(sprite);
        return graphic;
      };
      app.stage.addChild(shooter.graphic);
      const shooterProjectiles: Projectile[] = [];
      let shooterFireCooldown: number = shooter.fireInterval;
      const createCannonBall = () => {
        const graphic = new Sprite(cannonBallTexture);
        graphic.anchor.set(0.5);
        graphic.scale.set(0.8);
        return graphic;
      };
      const temporaryEffects: {
        sprite: Sprite;
        elapsedMs: number;
        durationMs: number;
      }[] = [];
      const createTemporaryEffect = (
        texture: typeof fireTexture,
        x: number,
        y: number,
        scale: number,
        durationMs: number,
        rotation = 0,
        zIndex = 1,
      ) => {
        const sprite = new Sprite(texture);
        sprite.anchor.set(0.5);
        sprite.scale.set(scale);
        sprite.rotation = rotation;
        sprite.position.set(x, y);
        sprite.zIndex = zIndex;
        app.stage.addChild(sprite);
        temporaryEffects.push({ sprite, elapsedMs: 0, durationMs });
      };
      const createMuzzleFlash = (
        x: number,
        y: number,
        directionX: number,
        directionY: number,
      ) => {
        createTemporaryEffect(
          fireTexture,
          x,
          y,
          0.55,
          100,
          Math.atan2(directionY, directionX) + Math.PI / 2,
        );
      };
      const createDamageEffect = (x: number, y: number) => {
        createTemporaryEffect(damageEffectTexture, x, y, 0.8, 140, 0, 21);
      };
      const createDeathEffect = (x: number, y: number, zIndex = 1) => {
        createTemporaryEffect(deathExplosionTexture, x, y, 0.9, 220, 0, zIndex);
      };
      const updateTemporaryEffects = (ticker: { deltaMS: number }) => {
        for (let index = temporaryEffects.length - 1; index >= 0; index--) {
          const effect = temporaryEffects[index];
          effect.elapsedMs += ticker.deltaMS;
          effect.sprite.alpha = Math.max(
            0,
            1 - effect.elapsedMs / effect.durationMs,
          );

          if (effect.elapsedMs >= effect.durationMs) {
            app.stage.removeChild(effect.sprite);
            effect.sprite.destroy({ texture: false });
            temporaryEffects.splice(index, 1);
          }
        }
      };
      app.ticker.add(updateTemporaryEffects);
      const fireShooterProjectile = () => {
        const directionX = player.graphic.x - shooter.graphic.x;
        const directionY = player.graphic.y - shooter.graphic.y;
        const distanceToShip = Math.hypot(directionX, directionY);
        if (distanceToShip === 0) return;

        const graphic = createCannonBall();
        graphic.position.set(shooter.graphic.x, shooter.graphic.y);
        createMuzzleFlash(graphic.x, graphic.y, directionX, directionY);
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
        const graphic = createCannonBall();
        graphic.position.set(
          player.graphic.x + directionX * 30,
          player.graphic.y + directionY * 30,
        );
        createMuzzleFlash(graphic.x, graphic.y, directionX, directionY);
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
          const graphic = createCannonBall();
          graphic.position.set(
            player.graphic.x + directionX * 30,
            player.graphic.y + directionY * 30,
          );
          createMuzzleFlash(graphic.x, graphic.y, directionX, directionY);
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
          pausedPanel.visible = isPaused;
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
      const hud = new Container();
      hud.zIndex = 10;

      const counterTextStyle = {
        fill: 0xffefc2,
        fontFamily: "Arial",
        fontSize: 20,
        fontWeight: "bold" as const,
        stroke: { color: 0x342012, width: 3 },
        dropShadow: {
          color: 0x21150d,
          alpha: 0.7,
          blur: 2,
          distance: 1,
        },
      };
      const playerHealthText = new Text({
        text: `${playerHealth} / ${GAME_CONFIG.player.maxHealth}`,
        style: counterTextStyle,
      });
      let playerScore = 0;
      const playerScoreText = new Text({
        text: `${playerScore}`,
        style: counterTextStyle,
      });
      const timerText = new Text({
        text: `${remainingTime}`,
        style: counterTextStyle,
      });

      const createCounter = (
        iconTexture: typeof heartTexture,
        text: Text,
        iconScaleY: number,
      ) => {
        const counter = new Container();
        const panel = new Sprite(counterPanelTexture);
        const icon = new Sprite(iconTexture);
        icon.anchor.set(0.5);
        icon.scale.set(2 / 3, iconScaleY);
        text.anchor.set(0, 0.5);
        const centerContent = () => {
          const contentGap = 8;
          const contentWidth = icon.width + contentGap + text.width;
          const contentLeft = (counterPanelTexture.width - contentWidth) / 2;
          icon.position.set(
            contentLeft + icon.width / 2,
            counterPanelTexture.height / 2,
          );
          text.position.set(
            contentLeft + icon.width + contentGap,
            counterPanelTexture.height / 2,
          );
        };
        centerContent();
        counter.addChild(panel, icon, text);
        hud.addChild(counter);
        return { counter, centerContent };
      };

      const healthCounter = createCounter(heartTexture, playerHealthText, 0.78);
      const scoreCounter = createCounter(scoreTexture, playerScoreText, 2 / 3);
      const timeCounter = createCounter(timeTexture, timerText, 2 / 3);
      app.stage.addChild(hud);

      const overlayStyle = {
        fill: 0xffefc2,
        fontFamily: "Arial",
        fontSize: 56,
        fontWeight: "bold" as const,
        stroke: { color: 0x342012, width: 4 },
        dropShadow: {
          color: 0x21150d,
          alpha: 0.75,
          blur: 3,
          distance: 2,
        },
      };
      const createOverlayPanel = () =>
        new Graphics()
          .roundRect(0, 0, 360, 120, 14)
          .fill({ color: 0x111923, alpha: 0.88 })
          .stroke({ color: 0xc28a42, alpha: 0.95, width: 3 });
      const gameOverPanel = createOverlayPanel();
      gameOverPanel.zIndex = 20;
      gameOverPanel.visible = false;
      const gameOverText = new Text({
        text: "GAME OVER",
        style: overlayStyle,
      });
      gameOverText.anchor.set(0.5);
      gameOverText.position.set(app.screen.width / 2, app.screen.height / 2);
      gameOverText.visible = false;
      gameOverText.zIndex = 20;
      const pausedPanel = createOverlayPanel();
      pausedPanel.zIndex = 20;
      pausedPanel.visible = false;
      const pausedText = new Text({
        text: "PAUSED",
        style: overlayStyle,
      });
      pausedText.anchor.set(0.5);
      pausedText.position.set(app.screen.width / 2, app.screen.height / 2);
      pausedText.visible = false;
      pausedText.zIndex = 20;
      app.stage.addChild(gameOverPanel, pausedPanel, gameOverText, pausedText);

      let lastHudWidth = 0;
      let lastHudHeight = 0;
      const updateHudLayout = () => {
        const { width, height } = app.screen;
        if (width === lastHudWidth && height === lastHudHeight) return;
        lastHudWidth = width;
        lastHudHeight = height;

        const panelWidth = counterPanelTexture.width;
        const margin = Math.max(16, width * 0.05);
        const gap = 8;
        const hudScale = Math.min(
          1,
          Math.max(0.1, (width - margin * 2 - gap * 2) / (panelWidth * 3)),
        );
        const scaledPanelWidth = panelWidth * hudScale;
        const top = Math.max(10, Math.min(20, height * 0.025));
        const centerX = (width - scaledPanelWidth) / 2;
        const sideX = Math.min(
          Math.max(margin, width * 0.12),
          centerX - scaledPanelWidth - gap,
        );

        healthCounter.counter.scale.set(hudScale);
        scoreCounter.counter.scale.set(hudScale);
        timeCounter.counter.scale.set(hudScale);
        healthCounter.counter.position.set(sideX, top);
        scoreCounter.counter.position.set(centerX, top);
        timeCounter.counter.position.set(width - sideX - scaledPanelWidth, top);

        const textSize = Math.max(14, 20 * hudScale) / hudScale;
        playerHealthText.style.fontSize = textSize;
        playerScoreText.style.fontSize = textSize;
        timerText.style.fontSize = textSize;
        healthCounter.centerContent();
        scoreCounter.centerContent();
        timeCounter.centerContent();

        const overlayScale = Math.min(
          1,
          Math.max(0.1, (width - 32) / 360),
          Math.max(0.1, (height - 32) / 120),
        );
        for (const panel of [gameOverPanel, pausedPanel]) {
          panel.scale.set(overlayScale);
          panel.position.set(
            (width - 360 * overlayScale) / 2,
            (height - 120 * overlayScale) / 2,
          );
        }
        gameOverText.scale.set(overlayScale);
        pausedText.scale.set(overlayScale);
        gameOverText.position.set(width / 2, height / 2);
        pausedText.position.set(width / 2, height / 2);
      };
      updateHudLayout();

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
        playerHealthText.text = `${playerHealth} / ${GAME_CONFIG.player.maxHealth}`;
        healthCounter.centerContent();
        playerScore = 0;
        playerScoreText.text = `${playerScore}`;
        scoreCounter.centerContent();
        remainingTime = duration;
        elapsedTickerFrames = 0;
        timerText.text = `${remainingTime}`;
        timeCounter.centerContent();
        shootCooldown = 0;
        sideShootCooldown = 0;
        shooterFireCooldown = shooter.fireInterval;

        player.reset(app.screen.width / 2, app.screen.height / 2);

        const chaserWasInactive = !chaser.active;
        chaser.reset(initialChaserPosition.x, initialChaserPosition.y);
        if (chaserWasInactive) app.stage.addChild(chaser.graphic);

        const shooterWasInactive = !shooter.active;
        if (shooterWasInactive) {
          shooter.graphic = createShooterGraphic();
        }
        shooter.reset(shooterPosition.x, shooterPosition.y);
        if (shooterWasInactive) app.stage.addChild(shooter.graphic);

        gameOverText.position.set(app.screen.width / 2, app.screen.height / 2);
        gameOverText.visible = false;
        gameOverPanel.visible = false;
        isGameOver = false;
      };
      const updateShip = (ticker: { deltaTime: number }) => {
        updateHudLayout();
        if (isGameOver || isPaused) return;

        elapsedTickerFrames += ticker.deltaTime;
        while (elapsedTickerFrames >= 60 && remainingTime > 0) {
          elapsedTickerFrames -= 60;
          remainingTime = Math.max(0, remainingTime - 1);
          timerText.text = `${remainingTime}`;
          timeCounter.centerContent();

          if (remainingTime === 0) {
            if (!isGameOver) {
              isGameOver = true;
              onGameOver(playerScore);
            }
            gameOverText.visible = true;
            gameOverPanel.visible = true;
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
          const collidesWithShooter =
            shooter.active &&
            Math.hypot(
              projectile.graphic.x - shooter.graphic.x,
              projectile.graphic.y - shooter.graphic.y,
            ) <
              projectileRadius + shooter.collisionRadius;

          if (collidesWithChaser) {
            createDamageEffect(chaser.graphic.x, chaser.graphic.y);
            chaser.health -= 1;
            if (chaser.health === 0) {
              createDeathEffect(chaser.graphic.x, chaser.graphic.y);
              chaser.active = false;
              app.stage.removeChild(chaser.graphic);
              chaser.graphic.destroy();
              playerScore += GAME_CONFIG.chaser.score;
              playerScoreText.text = `${playerScore}`;
              scoreCounter.centerContent();
              chaserRespawnCooldown = chaserRespawnInterval;
            }
          }

          if (collidesWithShooter) {
            createDamageEffect(shooter.graphic.x, shooter.graphic.y);
            shooter.health -= 1;
            if (shooter.health === 0) {
              createDeathEffect(shooter.graphic.x, shooter.graphic.y);
              shooter.active = false;
              app.stage.removeChild(shooter.graphic);
              shooter.graphic.destroy();
              playerScore += shooter.score;
              playerScoreText.text = `${playerScore}`;
              scoreCounter.centerContent();
            }
          }

          if (
            collidesWithIsland ||
            collidesWithChaser ||
            collidesWithShooter ||
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
            createDamageEffect(player.graphic.x, player.graphic.y);
            playerHealthText.text = `${playerHealth} / ${GAME_CONFIG.player.maxHealth}`;
            healthCounter.centerContent();

            if (playerHealth === 0) {
              createDeathEffect(player.graphic.x, player.graphic.y, 22);
              if (!isGameOver) {
                isGameOver = true;
                onGameOver(playerScore);
              }
              gameOverText.position.set(
                app.screen.width / 2,
                app.screen.height / 2,
              );
              gameOverText.visible = true;
              gameOverPanel.visible = true;
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
        app.ticker.remove(updateTemporaryEffects);
        for (const effect of temporaryEffects) {
          app.stage.removeChild(effect.sprite);
          effect.sprite.destroy({ texture: false });
        }
        temporaryEffects.length = 0;
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
