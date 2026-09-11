import { State } from './State.js';
import { ENEMY_CONFIG } from '../../config/enemy_sprite_config.js';

export class BossStanceState extends State {
  constructor() {
    super('STANCE', 0.35);
  }

  update(boss, dt, hero) {
    super.update(boss, dt);
    const dist = hero.x - boss.x;
    boss.facing = dist >= 0 ? 1 : -1;

    if (Math.abs(dist) > 90) {
      boss.x += boss.facing * ENEMY_CONFIG.boss.moveSpeed * dt;
    } else if (boss.energy >= ENEMY_CONFIG.boss.attackCost) {
      boss.changeState('WINDUP');
      return;
    }

    if (this.isComplete()) {
      this.elapsed = 0; // Loop stance movement
    }
  }
}
