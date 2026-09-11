/**
 * Enemy balance configs and Dino-style difficulty ramp settings
 */

export const DIFFICULTY_CONFIG = {
  easy: {
    heroHp: 150,
    minionSpawnDelayInitial: 3.5,
    minionSpawnDelayMin: 1.2,
    spawnRampRate: 0.02, // delay decrease per second
    archerCooldown: 4.0,
    bossSpawnInterval: 90.0,
    scoreMultiplier: 1.0
  },
  medium: {
    heroHp: 100,
    minionSpawnDelayInitial: 2.2,
    minionSpawnDelayMin: 0.7,
    spawnRampRate: 0.03,
    archerCooldown: 2.5,
    bossSpawnInterval: 60.0,
    scoreMultiplier: 1.5
  },
  hard: {
    heroHp: 75,
    minionSpawnDelayInitial: 1.2,
    minionSpawnDelayMin: 0.4,
    spawnRampRate: 0.045,
    archerCooldown: 1.5,
    bossSpawnInterval: 35.0,
    scoreMultiplier: 2.5
  }
};

export const ENEMY_CONFIG = {
  swarmer: {
    maxHp: 45,
    maxEnergy: 60,
    energyRegen: 10.0,
    moveSpeed: 135,
    attackCost: 20,
    damage: 12,
    hitbox: { width: 50, height: 45, offsetX: 0, offsetY: -50 },
    hurtbox: { width: 34, height: 55, offsetX: -17, offsetY: -55 },
    floatingBarOffsetY: -65,
    points: 150
  },
  archer: {
    maxHp: 65,
    maxEnergy: 80,
    energyRegen: 12.0,
    moveSpeed: 150,
    spacingMin: 250,
    spacingMax: 350,
    attackCost: 30,
    damage: 18,
    arrowSpeed: 480, // 8px per tick at 60fps
    arrowBounds: { width: 20, height: 6 },
    hurtbox: { width: 34, height: 60, offsetX: -17, offsetY: -60 },
    floatingBarOffsetY: -70,
    points: 250
  },
  boss: {
    maxHp: 320,
    maxEnergy: 100,
    energyRegen: 15.0,
    moveSpeed: 90,
    attackCost: 40,
    damage: 38,
    slamShockwaveRadius: 160,
    shakeIntensity: 12, // Heavy impact camera shake 12
    hitbox: { width: 140, height: 85, offsetX: -20, offsetY: -75 },
    hurtbox: { width: 60, height: 95, offsetX: -30, offsetY: -95 },
    floatingBarOffsetY: -105,
    points: 1000
  }
};
