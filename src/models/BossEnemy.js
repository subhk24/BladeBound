/**
 * The Juggernaut Armored Mini-Boss (7 Granular States)
 */
import { Enemy } from './Enemy.js';
import { ENEMY_CONFIG } from '../config/enemy_sprite_config.js';
import {
  BossStanceState, BossWindupState, BossChargeState, BossSlamState,
  BossHurtState, BossKneelState, BossCollapseState
} from './states/index.js';

export class BossEnemy extends Enemy {
  constructor(x, y) {
    const cfg = ENEMY_CONFIG.boss;
    super(x, y, cfg.maxHp, cfg.maxEnergy, 'boss');
    this.points = cfg.points;
    this.energyRegenRate = cfg.energyRegen;
    this.floatingBarOffsetY = cfg.floatingBarOffsetY;

    // Register 7 States
    const stateList = [
      new BossStanceState(),
      new BossWindupState(), new BossChargeState(), new BossSlamState(),
      new BossHurtState(), new BossKneelState(), new BossCollapseState()
    ];
    for (const st of stateList) {
      this.states.set(st.name, st);
    }

    this.changeState('STANCE');
  }

  spawnChargeAura() {
    if (this.engine) {
      this.engine.spawnChargeAura(this.x, this.y - 45);
    }
  }

  spawnShockwave(x, y) {
    if (this.engine) {
      this.engine.spawnShockwave(x, y, ENEMY_CONFIG.boss.slamShockwaveRadius, '#ffff33');
    }
  }

  onHurt() {
    // Boss only flinches if not currently in heavy attack swing
    if (this.currentState?.name === 'STANCE') {
      this.changeState('HURT');
    }
  }

  onDeath() {
    this.changeState('KNEEL');
  }

  getDefaultHurtbox() {
    const hb = ENEMY_CONFIG.boss.hurtbox;
    return {
      x: this.x + hb.offsetX,
      y: this.y + hb.offsetY,
      width: hb.width,
      height: hb.height
    };
  }
}
