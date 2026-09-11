/**
 * WaveSpawner: Dino-style endless exponential/asymptotic difficulty curve spawner
 */
import { DIFFICULTY_CONFIG } from '../config/enemy_sprite_config.js';
import { SwarmerEnemy } from '../models/SwarmerEnemy.js';
import { ArcherEnemy } from '../models/ArcherEnemy.js';
import { BossEnemy } from '../models/BossEnemy.js';

export class WaveSpawner {
  constructor(engine, difficulty = 'medium') {
    this.engine = engine;
    this.difficulty = difficulty;
    this.config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.medium;

    this.spawnTimer = 0;
    this.currentSpawnDelay = this.config.minionSpawnDelayInitial;
    this.bossTimer = 0;
    this.elapsedSurvival = 0;
    this.groundY = 540;
    this.spawnSide = 1; // Alternates left (-40) and right (1320)
  }

  setDifficulty(diff) {
    this.difficulty = diff;
    this.config = DIFFICULTY_CONFIG[diff] || DIFFICULTY_CONFIG.medium;
    this.currentSpawnDelay = this.config.minionSpawnDelayInitial;
    this.bossTimer = 0;
    this.elapsedSurvival = 0;
  }

  update(dt) {
    this.elapsedSurvival += dt;

    // Dino-style ramp: continuously decrease spawn delay down to minimum
    this.currentSpawnDelay = Math.max(
      this.config.minionSpawnDelayMin,
      this.config.minionSpawnDelayInitial - this.elapsedSurvival * this.config.spawnRampRate
    );

    // Minion Spawn Timer
    this.spawnTimer += dt;
    if (this.spawnTimer >= this.currentSpawnDelay) {
      this.spawnTimer = 0;
      this.spawnMinion();
    }

    // Boss Spawn Timer
    this.bossTimer += dt;
    if (this.bossTimer >= this.config.bossSpawnInterval) {
      this.bossTimer = 0;
      this.spawnBoss();
    }

    // Wave progression based on elapsed time (every 30 seconds = 1 wave)
    const newWave = Math.floor(this.elapsedSurvival / 30) + 1;
    if (newWave > this.engine.gameState.wave) {
      this.engine.gameState.wave = newWave;
      this.engine.showBanner(`WAVE ${newWave}`, '#ffcc00');
    }
  }

  spawnMinion() {
    this.spawnSide = -this.spawnSide;
    const spawnX = this.spawnSide === 1 ? 1320 : -40;

    // Ratio: 70% Swarmer, 30% Archer
    const isArcher = Math.random() < 0.35;
    if (isArcher) {
      const archer = new ArcherEnemy(spawnX, this.groundY, this.config.archerCooldown);
      archer.engine = this.engine;
      this.engine.addEnemy(archer);
    } else {
      const swarmer = new SwarmerEnemy(spawnX, this.groundY);
      swarmer.engine = this.engine;
      this.engine.addEnemy(swarmer);
    }
  }

  spawnBoss() {
    const spawnX = Math.random() > 0.5 ? 1320 : -40;
    const boss = new BossEnemy(spawnX, this.groundY);
    boss.engine = this.engine;
    this.engine.addEnemy(boss);

    this.engine.showBanner('ARMORED JUGGERNAUT APPROACHES!', '#ff3344');
    this.engine.cameraRenderer.shake(8, 0.5);
    this.engine.assetLoader.playSound('boss_charge');
  }

  reset() {
    this.spawnTimer = 0;
    this.currentSpawnDelay = this.config.minionSpawnDelayInitial;
    this.bossTimer = 0;
    this.elapsedSurvival = 0;
    this.spawnSide = 1;
  }
}
