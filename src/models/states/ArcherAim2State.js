import { State } from './State.js';

export class ArcherAim2State extends State {
  constructor() {
    super('AIM_2', 0.28);
  }

  update(archer, dt) {
    super.update(archer, dt);
    if (this.isComplete()) {
      archer.changeState('RELEASE');
    }
  }
}
