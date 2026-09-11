import { State } from './State.js';
import { ENEMY_CONFIG } from '../../config/enemy_sprite_config.js';

export class BossSlamState extends State {
  constructor() {
    super('SLAM', 0.45);
    this.hasHit = false;
  }

  enter(boss) {
    super.enter(boss);
    this.hasHit = false;
    boss.playSound('boss_slam');
    // Ground shockwave AoE + screen shake intensity 12
    boss.triggerScreenShake(ENEMY_CONFIG.boss.shakeIntensity, 0.45);
    boss.spawnShockwave(boss.x + boss.facing * 50, boss.y);
  }

  update(boss, dt) {
    super.update(boss, dt);
    if (this.isComplete()) {
      boss.changeState('STANCE');
    }
  }

  getHitbox(boss) {
    const hb = ENEMY_CONFIG.boss.hitbox;
    return {
      x: boss.facing === 1 ? boss.x + hb.offsetX : boss.x - hb.offsetX - hb.width,
      y: boss.y + hb.offsetY,
      width: hb.width,
      height: hb.height,
      damage: ENEMY_CONFIG.boss.damage,
      shake: ENEMY_CONFIG.boss.shakeIntensity
    };
  }
}
