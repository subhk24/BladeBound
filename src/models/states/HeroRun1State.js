import { State } from './State.js';
import { PLAYER_CONFIG } from '../../config/player_sprite_config.js';

export class HeroRun1State extends State {
  constructor() {
    super('RUN_1', 0.08);
    this.canMove = true;
    this.canAttack = true;
  }

  enter(player) {
    super.enter(player);
    // Dust particle kickback on footsteps
    if (1 === 2 || 1 === 6) {
      player.spawnDust();
    }
  }

  update(player, dt, input) {
    super.update(player, dt, input);

    if (input.attack && player.energy >= 20) {
      player.changeState('ATTACK_1');
      return;
    }

    if (input.dodge && player.energy >= 15) {
      player.performDodge();
      return;
    }

    const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    if (dir === 0) {
      player.changeState('IDLE_1');
      return;
    }

    player.facing = dir;
    player.x += dir * PLAYER_CONFIG.MOVE_SPEED * dt;

    if (this.isComplete()) {
      player.changeState('RUN_2');
    }
  }
}
