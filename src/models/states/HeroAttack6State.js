import { State } from './State.js';
import { PLAYER_CONFIG } from '../../config/player_sprite_config.js';

export class HeroAttack6State extends State {
  constructor() {
    super('ATTACK_6', 0.22);
    this.hasHit = false;
  }

  enter(player) {
    super.enter(player);
    this.hasHit = false;
    player.y = player.groundY; // Land slam
    player.vy = 0;
    player.playSound(PLAYER_CONFIG.COMBOS.PHASE_3.sound);
    player.triggerScreenShake(PLAYER_CONFIG.COMBOS.PHASE_3.shakeIntensity, 0.25);
    player.spawnShockwave(player.x + player.facing * 40, player.y);
  }

  update(player, dt, input) {
    super.update(player, dt, input);
    if (this.isComplete()) {
      player.changeState('IDLE_1');
    }
  }

  getHitbox(player) {
    const p3 = PLAYER_CONFIG.COMBOS.PHASE_3;
    return {
      x: player.facing === 1 ? player.x + 10 : player.x - 10 - p3.hitboxWidth,
      y: player.y - 75,
      width: p3.hitboxWidth,
      height: p3.hitboxHeight,
      damage: p3.damage,
      shake: p3.shakeIntensity,
      comboStep: 3
    };
  }
}
