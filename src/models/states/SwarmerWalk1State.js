import { State } from './State.js';
import { ENEMY_CONFIG } from '../../config/enemy_sprite_config.js';

export class SwarmerWalk1State extends State {
  constructor() {
    super('WALK_1', 0.10);
  }

  update(enemy, dt, hero) {
    super.update(enemy, dt);
    const dist = hero.x - enemy.x;
    enemy.facing = dist >= 0 ? 1 : -1;

    // Melee pursuit
    if (Math.abs(dist) > 55) {
      enemy.x += enemy.facing * ENEMY_CONFIG.swarmer.moveSpeed * dt;
    } else if (enemy.energy >= ENEMY_CONFIG.swarmer.attackCost) {
      enemy.changeState('WINDUP');
      return;
    }

    if (this.isComplete()) {
      enemy.changeState('WALK_2');
    }
  }
}
