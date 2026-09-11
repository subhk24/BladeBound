/**
 * Abstract Base State class for granular state machine
 */

export class State {
  constructor(name, duration = 0.1) {
    this.name = name;
    this.duration = duration; // seconds
    this.elapsed = 0;
    this.canMove = false;
    this.canAttack = false;
    this.isInvulnerable = false;
    this.animationKey = name;
  }

  enter(entity) {
    this.elapsed = 0;
  }

  update(entity, dt, input) {
    this.elapsed += dt;
  }

  exit(entity) {}

  isComplete() {
    return this.duration > 0 && this.elapsed >= this.duration;
  }

  getHitbox(entity) {
    return null;
  }

  getHurtbox(entity) {
    return entity.getDefaultHurtbox();
  }
}
