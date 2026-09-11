/**
 * The Swarmer Goblin Grunt (9 Granular States)
 */
import { Enemy } from './Enemy.js';
import { ENEMY_CONFIG } from '../config/enemy_sprite_config.js';
import {
  SwarmerWalk1State, SwarmerWalk2State, SwarmerWalk3State, SwarmerWalk4State,
  SwarmerWindupState, SwarmerSwingState, SwarmerFollowState,
  SwarmerHurtState, SwarmerDeadState
} from './states/index.js';

export class SwarmerEnemy extends Enemy {
  constructor(x, y) {
    const cfg = ENEMY_CONFIG.swarmer;
    super(x, y, cfg.maxHp, cfg.maxEnergy, 'swarmer');
    this.points = cfg.points;
    this.energyRegenRate = cfg.energyRegen;
    this.floatingBarOffsetY = cfg.floatingBarOffsetY;

    // Register 9 States
    const stateList = [
      new SwarmerWalk1State(), new SwarmerWalk2State(),
      new SwarmerWalk3State(), new SwarmerWalk4State(),
      new SwarmerWindupState(), new SwarmerSwingState(), new SwarmerFollowState(),
      new SwarmerHurtState(), new SwarmerDeadState()
    ];
    for (const st of stateList) {
      this.states.set(st.name, st);
    }

    this.changeState('WALK_1');
  }

  onHurt() {
    this.changeState('HURT');
  }

  onDeath() {
    this.changeState('DEAD');
  }

  getDefaultHurtbox() {
    const hb = ENEMY_CONFIG.swarmer.hurtbox;
    return {
      x: this.x + hb.offsetX,
      y: this.y + hb.offsetY,
      width: hb.width,
      height: hb.height
    };
  }
}
