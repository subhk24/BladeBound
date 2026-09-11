import { State } from './State.js';

export class HeroAttack2State extends State {
  constructor() {
    super('ATTACK_2', 0.14);
    this.bufferedAttack = false;
  }

  enter(player) {
    super.enter(player);
    this.bufferedAttack = false;
  }

  update(player, dt, input) {
    super.update(player, dt, input);
    if (input.attack) {
      this.bufferedAttack = true;
    }

    if (this.isComplete()) {
      if (this.bufferedAttack && player.energy >= 20) {
        player.changeState('ATTACK_3');
      } else {
        player.changeState('IDLE_1');
      }
    }
  }
}
