import { State } from './State.js';

export class BossCollapseState extends State {
  constructor() {
    super('COLLAPSE', 1.0);
    this.isInvulnerable = true;
  }

  enter(boss) {
    super.enter(boss);
    boss.isCorpse = true;
  }

  update(boss, dt) {
    super.update(boss, dt);
    if (this.isComplete()) {
      boss.markForRemoval();
    }
  }
}
