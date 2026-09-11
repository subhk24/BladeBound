import { State } from './State.js';

export class HeroHurt1State extends State {
  constructor() {
    super('HURT_1', 0.08); // Hit-stop flinch
  }

  enter(player) {
    super.enter(player);
    player.playSound('hero_hurt');
  }

  update(player, dt, input) {
    super.update(player, dt, input);
    if (this.isComplete()) {
      player.changeState('HURT_2');
    }
  }
}
