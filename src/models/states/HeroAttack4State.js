import { State } from './State.js';

export class HeroAttack4State extends State {
  constructor() {
    super('ATTACK_4', 0.16);
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
      if (this.bufferedAttack && player.energy >= 30) {
        player.changeState('ATTACK_5');
      } else {
        player.changeState('IDLE_1');
      }
    }
  }
}
