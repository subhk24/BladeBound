import { State } from './State.js';

export class BossChargeState extends State {
  constructor() {
    super('CHARGE', 0.32);
  }

  enter(boss) {
    super.enter(boss);
    boss.spawnChargeAura();
  }

  update(boss, dt) {
    super.update(boss, dt);
    if (this.isComplete()) {
      boss.changeState('SLAM');
    }
  }
}
