import { State } from './State.js';

export class ArcherReleaseState extends State {
  constructor() {
    super('RELEASE', 0.12);
    this.hasSpawnedArrow = false;
  }

  enter(archer) {
    super.enter(archer);
    this.hasSpawnedArrow = false;
    archer.playSound('archer_shoot');
    archer.spawnArrow();
  }

  update(archer, dt) {
    super.update(archer, dt);
    if (this.isComplete()) {
      archer.changeState('RECOIL');
    }
  }
}
