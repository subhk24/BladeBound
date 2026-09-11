import { State } from './State.js';
import { ENEMY_CONFIG } from '../../config/enemy_sprite_config.js';

export class BossWindupState extends State {
  constructor() {
    super('WINDUP', 0.40);
  }

  enter(boss) {
    super.enter(boss);
    boss.energy = Math.max(0, boss.energy - ENEMY_CONFIG.boss.attackCost);
    boss.playSound('boss_charge');
  }

  update(boss, dt) {
    super.update(boss, dt);
    if (this.isComplete()) {
      boss.changeState('CHARGE');
    }
  }
}
