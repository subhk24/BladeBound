import { State } from './State.js';
import { PLAYER_CONFIG } from '../../config/player_sprite_config.js';

export class HeroAttack1State extends State {
  constructor() {
    super('ATTACK_1', 0.12);
    this.hasHit = false;
  }

  enter(player) {
    super.enter(player);
    this.hasHit = false;
    player.energy = Math.max(0, player.energy - PLAYER_CONFIG.COMBOS.PHASE_1.energyCost);
    player.playSound(PLAYER_CONFIG.COMBOS.PHASE_1.sound);
  }

  update(player, dt, input) {
    super.update(player, dt, input);
    if (this.isComplete()) {
      player.changeState('ATTACK_2');
    }
  }

  getHitbox(player) {
    const p1 = PLAYER_CONFIG.COMBOS.PHASE_1;
    return {
      x: player.facing === 1 ? player.x + 10 : player.x - 10 - p1.hitboxWidth,
      y: player.y - 65,
      width: p1.hitboxWidth,
      height: p1.hitboxHeight,
      damage: p1.damage,
      shake: p1.shakeIntensity,
      comboStep: 1
    };
  }
}
