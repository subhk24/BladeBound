import { State } from './State.js';

export class ArcherHurtState extends State {
  constructor() {
    super('HURT', 0.15);
  }

  enter(archer) {
    super.enter(archer);
    archer.playSound('arrow_hit');
    archer.vx = -archer.facing * 120;
  }

  update(archer, dt) {
    super.update(archer, dt);
    archer.x += archer.vx * dt;
    archer.vx *= 0.85;

    if (this.isComplete()) {
      archer.changeState('WALK_1');
    }
  }
}
