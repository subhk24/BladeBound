import { State } from './State.js';
import { ENEMY_CONFIG } from '../../config/enemy_sprite_config.js';

export class ArcherWalk3State extends State {
  constructor() {
    super('WALK_3', 0.12);
  }

  update(archer, dt, hero) {
    super.update(archer, dt);
    const dist = hero.x - archer.x;
    archer.facing = dist >= 0 ? 1 : -1;
    const absDist = Math.abs(dist);

    if (absDist < ENEMY_CONFIG.archer.spacingMin) {
      // Back away to maintain spacing
      archer.x -= archer.facing * ENEMY_CONFIG.archer.moveSpeed * dt;
    } else if (absDist > ENEMY_CONFIG.archer.spacingMax) {
      // Move closer
      archer.x += archer.facing * ENEMY_CONFIG.archer.moveSpeed * dt;
    } else if (archer.energy >= ENEMY_CONFIG.archer.attackCost && archer.canShoot) {
      archer.changeState('AIM_1');
      return;
    }

    if (this.isComplete()) {
      archer.changeState('WALK_1');
    }
  }
}
