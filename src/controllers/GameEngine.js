/**
 * GameEngine: Orchestrates decoupled MVC pattern, 60 FPS loop, and backend sync
 */
import { Player } from '../models/Player.js';
import { GameState } from '../models/GameState.js';
import { SpriteRenderer } from '../views/SpriteRenderer.js';
import { CameraRenderer } from '../views/CameraRenderer.js';
import { UIRenderer } from '../views/UIRenderer.js';
import { InputController } from './InputController.js';
import { CombatController } from './CombatController.js';
import { WaveSpawner } from './WaveSpawner.js';

export class GameEngine {
  constructor(canvas, assetLoader) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.canvas.width = 1280;
    this.canvas.height = 720;

    this.assetLoader = assetLoader;
    this.cameraRenderer = new CameraRenderer();
    this.spriteRenderer = new SpriteRenderer(assetLoader);
    this.uiRenderer = new UIRenderer();
    this.inputController = new InputController();
    this.combatController = new CombatController(this);

    this.gameState = new GameState('medium');
    this.waveSpawner = new WaveSpawner(this, 'medium');

    this.player = null;
    this.enemies = [];
    this.projectiles = [];
    this.banners = [];

    this.lastTime = 0;
    this.animationFrameId = null;
    this.isRunning = false;

    // Callbacks for DOM overlays
    this.onGameOverCallback = null;
    this.onLifeChangeCallback = null;
  }

  init(characterArchetype = 'hero_female', difficulty = 'medium') {
    this.gameState.setDifficulty(difficulty);
    this.gameState.reset();
    this.waveSpawner.setDifficulty(difficulty);
    this.waveSpawner.reset();

    const heroHp = this.waveSpawner.config.heroHp;
    this.player = new Player(640, 540, characterArchetype, heroHp);
    this.player.engine = this;

    this.enemies = [];
    this.projectiles = [];
    this.banners = [];
    this.gameState.gameStarted = true;

    this.showBanner('SURVIVE THE ARENA!', '#00ffcc');
  }

  start() {
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  togglePause() {
    if (!this.gameState.gameStarted || this.gameState.isGameOver) return;
    this.gameState.isPaused = !this.gameState.isPaused;
    if (this.onPauseChangeCallback) {
      this.onPauseChangeCallback(this.gameState.isPaused);
    }
    if (!this.gameState.isPaused) {
      this.lastTime = performance.now();
      this.loop(this.lastTime);
    }
  }

  quitToTitle() {
    this.stop();
    this.gameState.isPaused = false;
    this.gameState.isGameOver = false;
    this.gameState.gameStarted = false;
    this.player = null;
    this.enemies = [];
    this.projectiles = [];
    this.banners = [];
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.onQuitToTitleCallback) {
      this.onQuitToTitleCallback();
    }
  }

  loop(currentTime) {
    if (!this.isRunning) return;

    const rawDt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    const dt = Math.min(0.1, rawDt); // Prevent spiral of death on tab unfocus

    if (!this.gameState.isPaused && !this.gameState.isGameOver) {
      this.update(dt);
    }

    this.render();

    if (this.isRunning && !this.gameState.isPaused) {
      this.animationFrameId = requestAnimationFrame((time) => this.loop(time));
    }
  }

  update(dt) {
    const input = this.inputController.getInput();

    // Camera and screenshake always update
    this.cameraRenderer.update(dt);

    // Hit-stop frame freeze check
    if (this.cameraRenderer.hitStopFrames > 0) {
      this.cameraRenderer.hitStopFrames--;
      return; // Freeze entities for hit-stop impact
    }

    // Update Player
    if (this.player) {
      this.player.update(dt, input);
    }

    // Update Enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(dt, this.player);
      if (enemy.shouldRemove) {
        this.enemies.splice(i, 1);
      }
    }

    // Update Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.update(dt);
      if (!proj.isAlive) {
        this.projectiles.splice(i, 1);
      }
    }

    // Combat Collisions
    this.combatController.update(this.player, this.enemies, this.projectiles);

    // Spawner and Difficulty Ramp
    this.waveSpawner.update(dt);

    // GameState survival metrics
    this.gameState.update(dt);

    // VFX Particles and damage popups
    this.spriteRenderer.update(dt);

    // Banner notifications countdown
    for (let i = this.banners.length - 1; i >= 0; i--) {
      this.banners[i].duration -= dt;
      if (this.banners[i].duration <= 0) {
        this.banners.splice(i, 1);
      }
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Apply Camera Shake & Viewport translation
    this.cameraRenderer.apply(this.ctx);

    // 1. Arena Background
    this.spriteRenderer.renderBackground(this.ctx, this.canvas.width, this.canvas.height);

    // 2. Projectiles
    for (const proj of this.projectiles) {
      this.spriteRenderer.renderProjectile(this.ctx, proj);
    }

    // 3. Enemies
    for (const enemy of this.enemies) {
      this.spriteRenderer.renderEntity(this.ctx, enemy);
    }

    // 4. Player Hero
    if (this.player) {
      this.spriteRenderer.renderEntity(this.ctx, this.player);
    }

    // 5. VFX Particles & Shockwaves
    this.spriteRenderer.renderVFX(this.ctx);

    // 6. Floating Overhead Enemy HUD Bars
    this.uiRenderer.renderEnemyBars(this.ctx, this.enemies);

    this.cameraRenderer.restore(this.ctx);

    // 7. Static Top Player HUD & Modals
    if (this.player) {
      this.uiRenderer.renderTopHUD(this.ctx, this.player, this.gameState);
    }

    // 8. Wave / Boss Announcement Banners
    this.renderBanners();
  }

  renderBanners() {
    for (const banner of this.banners) {
      const alpha = Math.min(1.0, banner.duration);
      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      this.ctx.font = 'bold 36px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.lineWidth = 5;
      this.ctx.strokeStyle = '#000000';
      this.ctx.strokeText(banner.text, this.canvas.width / 2, 220);
      this.ctx.fillStyle = banner.color;
      this.ctx.fillText(banner.text, this.canvas.width / 2, 220);
      this.ctx.restore();
    }
  }

  showBanner(text, color = '#ffffff', duration = 2.0) {
    this.banners.push({ text, color, duration });
  }

  addEnemy(enemy) {
    this.enemies.push(enemy);
  }

  addProjectile(proj) {
    this.projectiles.push(proj);
  }

  onEnemyKilled(enemy) {
    const gained = this.gameState.addEnemyKill(enemy.points, this.player?.comboCount || 0);
    this.spawnDamageNumber(enemy.x, enemy.y - 70, `+${gained}`, true);
  }

  onLifeChanged(remainingLives) {
    if (this.onLifeChangeCallback) {
      this.onLifeChangeCallback(remainingLives);
    }
  }

  onGameOver() {
    this.gameState.isGameOver = true;
    this.stop();
    this.assetLoader.playSound('game_over');
    if (this.onGameOverCallback) {
      this.onGameOverCallback({
        score: this.gameState.score,
        wave: this.gameState.wave,
        kills: this.gameState.kills,
        survivalTime: this.gameState.survivalTime,
        difficulty: this.gameState.difficulty,
        character: this.player.character
      });
    }
  }

  // Particle & Audio hooks
  spawnDust(x, y) { this.spriteRenderer.addDust(x, y); }
  spawnBloodBurst(x, y, dir) { this.spriteRenderer.addBlood(x, y, dir); }
  spawnSpark(x, y) { this.spriteRenderer.addSpark(x, y); }
  spawnShockwave(x, y, radius, color) { this.spriteRenderer.addShockwave(x, y, radius, color); }
  spawnDamageNumber(x, y, text, isCrit) { this.spriteRenderer.addDamagePopup(x, y, text, isCrit); }
  spawnChargeAura(x, y) { this.spriteRenderer.addSpark(x, y); }
  spawnDashTrail(x, y, facing, cat, stateKey) {
    this.spriteRenderer.addDashTrail(x, y, facing, cat, stateKey);
  }

  // Backend REST API Sync
  async submitScoreToBackend(playerName) {
    try {
      const payload = {
        player_name: playerName,
        score: this.gameState.score,
        wave: this.gameState.wave,
        kills: this.gameState.kills,
        difficulty: this.gameState.difficulty,
        survival_time: Math.round(this.gameState.survivalTime * 10) / 10,
        character: this.player ? this.player.character : 'female'
      };

      const res = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err) {
      console.warn('Leaderboard submission error:', err);
      return null;
    }
  }

  async fetchLeaderboard(difficulty = 'all') {
    try {
      const res = await fetch(`/api/leaderboard?difficulty=${difficulty}`);
      return await res.json();
    } catch (err) {
      console.warn('Leaderboard fetch error:', err);
      return { leaderboard: [] };
    }
  }
}
