import { State } from './State.js';

export class SwarmerDeadState extends State {
  constructor() {
    super('DEAD', 0.6);
    this.isInvulnerable = true;
  }

  enter(enemy) {
    super.enter(enemy);
    enemy.playSound('swarmer_dead');
    enemy.isCorpse = true;
  }

  update(enemy, dt) {
    super.update(enemy, dt);
    if (this.isComplete()) {
      enemy.markForRemoval();
    }
  }
}
