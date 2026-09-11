import { State } from './State.js';

export class HeroDefeatFallenState extends State {
  constructor() {
    super('DEFEAT_FALLEN', 0.75);
    this.isInvulnerable = true;
    this.hasTriggeredLifeLoss = false;
  }

  enter(player) {
    super.enter(player);
    this.hasTriggeredLifeLoss = false;
  }

  update(player, dt, input) {
    super.update(player, dt, input);
    if (!this.hasTriggeredLifeLoss && this.elapsed >= 0.2) {
      this.hasTriggeredLifeLoss = true;
      player.handleLifeLoss();
    }
  }
}
