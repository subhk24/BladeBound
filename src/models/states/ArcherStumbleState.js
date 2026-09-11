import { State } from './State.js';

export class ArcherStumbleState extends State {
  constructor() {
    super('STUMBLE', 0.25);
    this.isInvulnerable = true;
  }

  enter(archer) {
    super.enter(archer);
    archer.vx = -archer.facing * 160;
  }

  update(archer, dt) {
    super.update(archer, dt);
    archer.x += archer.vx * dt;
    archer.vx *= 0.90;

    if (this.isComplete()) {
      archer.changeState('DEAD');
    }
  }
}
