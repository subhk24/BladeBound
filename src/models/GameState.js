/**
 * GameState Model tracking score, time, wave, difficulty, and combo multipliers
 */
import { DIFFICULTY_CONFIG } from '../config/enemy_sprite_config.js';

export class GameState {
  constructor(difficulty = 'medium') {
    this.difficulty = difficulty;
    this.diffConfig = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.medium;
    this.scoreMultiplier = this.diffConfig.scoreMultiplier;

    this.score = 0;
    this.personalBest = 0;
    try {
      this.personalBest = parseInt(localStorage.getItem('bladebound_personal_best') || '0', 10) || 0;
    } catch (_) {}

    this.wave = 1;
    this.kills = 0;
    this.survivalTime = 0; // seconds

    this.isPaused = false;
    this.isGameOver = false;
    this.gameStarted = false;
  }

  update(dt) {
    if (this.gameStarted && !this.isPaused && !this.isGameOver) {
      this.survivalTime += dt;
      // Passive survival points
      this.score += Math.floor(10 * this.scoreMultiplier * dt);
      if (this.score > this.personalBest) {
        this.personalBest = this.score;
        try { localStorage.setItem('bladebound_personal_best', String(this.personalBest)); } catch (_) {}
      }
    }
  }

  addEnemyKill(points, comboStreak = 0) {
    this.kills += 1;
    const comboBonus = 1.0 + Math.min(2.0, comboStreak * 0.1);
    const added = Math.round(points * this.scoreMultiplier * comboBonus);
    this.score += added;
    if (this.score > this.personalBest) {
      this.personalBest = this.score;
      try { localStorage.setItem('bladebound_personal_best', String(this.personalBest)); } catch (_) {}
    }
    return added;
  }

  setDifficulty(diff) {
    this.difficulty = diff;
    this.diffConfig = DIFFICULTY_CONFIG[diff] || DIFFICULTY_CONFIG.medium;
    this.scoreMultiplier = this.diffConfig.scoreMultiplier;
  }

  reset() {
    this.score = 0;
    this.wave = 1;
    this.kills = 0;
    this.survivalTime = 0;
    this.isPaused = false;
    this.isGameOver = false;
    this.gameStarted = false;
    try {
      this.personalBest = parseInt(localStorage.getItem('bladebound_personal_best') || '0', 10) || 0;
    } catch (_) {}
  }
}
