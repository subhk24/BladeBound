import { State } from './State.js';

export class HeroHurt2State extends State {
  constructor() {
    super('HURT_2', 0.12); // Knockback slide
  }

  enter(player) {
    super.enter(player);
    player.vx = -player.facing * 180;
  }

  update(player, dt, input) {
    super.update(player, dt, input);
    player.x += player.vx * dt;
    player.vx *= 0.88;

    if (this.isComplete()) {
      player.changeState('HURT_3');
    }
  }
}
