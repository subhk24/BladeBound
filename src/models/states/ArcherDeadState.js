import { State } from './State.js';

export class ArcherDeadState extends State {
  constructor() {
    super('DEAD', 0.65);
    this.isInvulnerable = true;
  }

  enter(archer) {
    super.enter(archer);
    archer.isCorpse = true;
  }

  update(archer, dt) {
    super.update(archer, dt);
    if (this.isComplete()) {
      archer.markForRemoval();
    }
  }
}
