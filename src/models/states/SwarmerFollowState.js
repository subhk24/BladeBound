import { State } from './State.js';

export class SwarmerFollowState extends State {
  constructor() {
    super('FOLLOW', 0.20);
  }

  update(enemy, dt) {
    super.update(enemy, dt);
    if (this.isComplete()) {
      enemy.changeState('WALK_1');
    }
  }
}
