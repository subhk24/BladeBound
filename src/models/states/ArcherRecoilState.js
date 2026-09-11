import { State } from './State.js';

export class ArcherRecoilState extends State {
  constructor() {
    super('RECOIL', 0.20);
  }

  update(archer, dt) {
    super.update(archer, dt);
    if (this.isComplete()) {
      archer.resetShootCooldown();
      archer.changeState('WALK_1');
    }
  }
}
