import { State } from './State.js';

export class SwarmerHurtState extends State {
  constructor() {
    super('HURT', 0.18);
  }

  enter(enemy) {
    super.enter(enemy);
    enemy.playSound('swarmer_hurt');
    enemy.vx = -enemy.facing * 140;
  }

  update(enemy, dt) {
    super.update(enemy, dt);
    enemy.x += enemy.vx * dt;
    enemy.vx *= 0.85;

    if (this.isComplete()) {
      enemy.changeState('WALK_1');
    }
  }
}
