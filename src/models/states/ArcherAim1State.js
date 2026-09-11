import { State } from './State.js';
import { ENEMY_CONFIG } from '../../config/enemy_sprite_config.js';

export class ArcherAim1State extends State {
  constructor() {
    super('AIM_1', 0.22);
  }

  enter(archer) {
    super.enter(archer);
    archer.energy = Math.max(0, archer.energy - ENEMY_CONFIG.archer.attackCost);
  }

  update(archer, dt) {
    super.update(archer, dt);
    if (this.isComplete()) {
      archer.changeState('AIM_2');
    }
  }
}
