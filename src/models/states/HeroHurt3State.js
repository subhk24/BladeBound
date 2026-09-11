import { State } from './State.js';

export class HeroHurt3State extends State {
  constructor() {
    super('HURT_3', 0.10); // Recovery
  }

  update(player, dt, input) {
    super.update(player, dt, input);
    if (this.isComplete()) {
      player.changeState('IDLE_1');
    }
  }
}
