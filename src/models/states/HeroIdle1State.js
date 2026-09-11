import { State } from './State.js';

export class HeroIdle1State extends State {
  constructor() {
    super('IDLE_1', 0.12);
    this.canMove = true;
    this.canAttack = true;
  }

  update(player, dt, input) {
    super.update(player, dt, input);

    if (input.attack && player.energy >= 20) {
      player.changeState('ATTACK_1');
      return;
    }

    if (input.dodge && player.energy >= 15) {
      player.performDodge();
      return;
    }

    if (input.left || input.right) {
      player.changeState('RUN_1');
      return;
    }

    if (this.isComplete()) {
      player.changeState('IDLE_2');
    }
  }
}
