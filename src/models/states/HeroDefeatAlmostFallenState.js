import { State } from './State.js';

export class HeroDefeatAlmostFallenState extends State {
  constructor() {
    super('DEFEAT_ALMOST_FALLEN', 0.55);
    this.isInvulnerable = true;
  }

  enter(player) {
    super.enter(player);
    player.vx = 0;
    player.playSound('hero_defeat');
  }

  update(player, dt, input) {
    super.update(player, dt, input);
    if (this.isComplete()) {
      player.changeState('DEFEAT_FALLEN');
    }
  }
}
