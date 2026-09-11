import { State } from './State.js';

export class BossHurtState extends State {
  constructor() {
    super('HURT', 0.20);
  }

  enter(boss) {
    super.enter(boss);
    boss.playSound('boss_hurt');
    boss.vx = -boss.facing * 60;
  }

  update(boss, dt) {
    super.update(boss, dt);
    boss.x += boss.vx * dt;
    boss.vx *= 0.85;

    if (this.isComplete()) {
      boss.changeState('STANCE');
    }
  }
}
