import { State } from './State.js';
import { ENEMY_CONFIG } from '../../config/enemy_sprite_config.js';

export class SwarmerSwingState extends State {
  constructor() {
    super('SWING', 0.16);
    this.hasHit = false;
  }

  enter(enemy) {
    super.enter(enemy);
    this.hasHit = false;
    enemy.playSound('swarmer_swing');
  }

  update(enemy, dt) {
    super.update(enemy, dt);
    if (this.isComplete()) {
      enemy.changeState('FOLLOW');
    }
  }

  getHitbox(enemy) {
    const hb = ENEMY_CONFIG.swarmer.hitbox;
    return {
      x: enemy.facing === 1 ? enemy.x + hb.offsetX : enemy.x - hb.offsetX - hb.width,
      y: enemy.y + hb.offsetY,
      width: hb.width,
      height: hb.height,
      damage: ENEMY_CONFIG.swarmer.damage
    };
  }
}
