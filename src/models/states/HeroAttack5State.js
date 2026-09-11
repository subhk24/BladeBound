import { State } from './State.js';
import { PLAYER_CONFIG } from '../../config/player_sprite_config.js';

export class HeroAttack5State extends State {
  constructor() {
    super('ATTACK_5', 0.16);
  }

  enter(player) {
    super.enter(player);
    player.energy = Math.max(0, player.energy - PLAYER_CONFIG.COMBOS.PHASE_3.energyCost);
    // Jump prep / overhead raise
    player.vy = -160;
  }

  update(player, dt, input) {
    super.update(player, dt, input);
    player.y += player.vy * dt;
    player.vy += 400 * dt;

    if (this.isComplete()) {
      player.changeState('ATTACK_6');
    }
  }
}
