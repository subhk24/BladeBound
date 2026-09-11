import { State } from './State.js';
import { PLAYER_CONFIG } from '../../config/player_sprite_config.js';

export class HeroAttack3State extends State {
  constructor() {
    super('ATTACK_3', 0.14);
    this.hasHit = false;
  }

  enter(player) {
    super.enter(player);
    this.hasHit = false;
    player.energy = Math.max(0, player.energy - PLAYER_CONFIG.COMBOS.PHASE_2.energyCost);
    player.playSound(PLAYER_CONFIG.COMBOS.PHASE_2.sound);
    // Forward burst impulse (+8px instantaneous burst + forward velocity)
    player.x += player.facing * PLAYER_CONFIG.COMBOS.PHASE_2.forwardBurst;
    player.vx = player.facing * 180;
    player.spawnDashTrail();
  }

  update(player, dt, input) {
    super.update(player, dt, input);
    player.x += player.vx * dt;
    player.vx *= 0.85;

    if (this.isComplete()) {
      player.changeState('ATTACK_4');
    }
  }

  getHitbox(player) {
    const p2 = PLAYER_CONFIG.COMBOS.PHASE_2;
    return {
      x: player.facing === 1 ? player.x + 15 : player.x - 15 - p2.hitboxWidth,
      y: player.y - 65,
      width: p2.hitboxWidth,
      height: p2.hitboxHeight,
      damage: p2.damage,
      shake: p2.shakeIntensity,
      comboStep: 2
    };
  }
}
