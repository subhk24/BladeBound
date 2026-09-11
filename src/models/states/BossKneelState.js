import { State } from './State.js';

export class BossKneelState extends State {
  constructor() {
    super('KNEEL', 0.50);
    this.isInvulnerable = true;
  }

  enter(boss) {
    super.enter(boss);
    boss.playSound('boss_defeat');
  }

  update(boss, dt) {
    super.update(boss, dt);
    if (this.isComplete()) {
      boss.changeState('COLLAPSE');
    }
  }
}
