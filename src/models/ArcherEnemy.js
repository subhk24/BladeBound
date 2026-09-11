/**
 * The Rusher / Skirmisher Hooded Archer (10 Granular States + Projectile)
 */
import { Enemy } from './Enemy.js';
import { ENEMY_CONFIG } from '../config/enemy_sprite_config.js';
import { Projectile } from './Projectile.js';
import {
  ArcherWalk1State, ArcherWalk2State, ArcherWalk3State,
  ArcherAim1State, ArcherAim2State, ArcherReleaseState, ArcherRecoilState,
  ArcherHurtState, ArcherStumbleState, ArcherDeadState
} from './states/index.js';

export class ArcherEnemy extends Enemy {
  constructor(x, y, shootCooldown = 2.5) {
    const cfg = ENEMY_CONFIG.archer;
    super(x, y, cfg.maxHp, cfg.maxEnergy, 'archer');
    this.points = cfg.points;
    this.energyRegenRate = cfg.energyRegen;
    this.floatingBarOffsetY = cfg.floatingBarOffsetY;

    this.shootCooldownMax = shootCooldown;
    this.shootTimer = Math.random() * 1.5; // Staggered initial shot
    this.canShoot = false;

    // Register 10 States
    const stateList = [
      new ArcherWalk1State(), new ArcherWalk2State(), new ArcherWalk3State(),
      new ArcherAim1State(), new ArcherAim2State(), new ArcherReleaseState(), new ArcherRecoilState(),
      new ArcherHurtState(), new ArcherStumbleState(), new ArcherDeadState()
    ];
    for (const st of stateList) {
      this.states.set(st.name, st);
    }

    this.changeState('WALK_1');
  }

  update(dt, hero) {
    if (this.shootTimer > 0) {
      this.shootTimer -= dt;
      this.canShoot = this.shootTimer <= 0;
    }
    super.update(dt, hero);
  }

  resetShootCooldown() {
    this.shootTimer = this.shootCooldownMax;
    this.canShoot = false;
  }

  spawnArrow() {
    if (!this.engine) return;
    const cfg = ENEMY_CONFIG.archer;
    const arrowX = this.facing === 1 ? this.x + 35 : this.x - 35;
    const arrowY = this.y - 42;
    const projectile = new Projectile(
      arrowX,
      arrowY,
      this.facing * cfg.arrowSpeed,
      0,
      cfg.arrowBounds.width,
      cfg.arrowBounds.height,
      cfg.damage,
      'enemy',
      this.engine
    );
    this.engine.addProjectile(projectile);
  }

  onHurt() {
    if (this.currentState?.name.startsWith('AIM')) {
      // Interrupted during aim
      this.changeState('HURT');
    } else {
      this.changeState('HURT');
    }
  }

  onDeath() {
    this.changeState('STUMBLE');
  }

  getDefaultHurtbox() {
    const hb = ENEMY_CONFIG.archer.hurtbox;
    return {
      x: this.x + hb.offsetX,
      y: this.y + hb.offsetY,
      width: hb.width,
      height: hb.height
    };
  }
}
