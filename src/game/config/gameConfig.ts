export const GAME_CONFIG = {
  player: {
    maxHealth: 3,
    movementSpeed: 4,
    rotationSpeed: 0.05,
    collisionRadius: 20,
  },
  chaser: {
    maxHealth: 3,
    movementSpeed: 1.5,
    collisionRadius: 18,
    score: 100,
  },
  spawnRate: {
    low: 240,
    normal: 120,
    high: 60,
  },
  shooter: {
    radius: 18,
    speed: 1.2,
    projectileSpeed: 5,
    projectileRadius: 4,
    fireInterval: 90,
  },
  projectile: {
    radius: 4,
    speed: 8,
    cooldown: 15,
    sideShotCooldown: 30,
    sideShotSpread: 0.35,
  },
  game: {
    duration: 30,
  },
} as const;
