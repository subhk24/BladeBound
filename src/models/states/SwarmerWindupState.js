import { State } from './State.js';
import { ENEMY_CONFIG } from '../../config/enemy_sprite_config.js';

export class SwarmerWindupState extends State {
  constructor() {
    super('WINDUP', 0.28);
  }

  enter(enemy) {
    super.enter(enemy);
    enemy.energy = Math.max(0, enemy.energy - ENEMY_CONFIG.swarmer.attackCost);
  }

  update(enemy, dt) {
    super.update(enemy, dt);
    if (this.isComplete()) {
      enemy.changeState('SWING');
    }
  }
}
