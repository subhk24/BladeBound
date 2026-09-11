/**
 * Base Enemy class with 2-tier floating HUD (Red HP, Cyan Energy) and AI hooks
 */
import { Entity } from './Entity.js';

export class Enemy extends Entity {
  constructor(x, y, maxHp, maxEnergy, archetype) {
    super(x, y, maxHp, maxEnergy);
    this.archetype = archetype;
    this.points = 100;
    this.floatingBarOffsetY = -60;
    this.shouldRemove = false;
  }

  update(dt, hero) {
    super.update(dt);
    if (this.isCorpse && this.currentState) {
      this.currentState.update(this, dt);
      return;
    }
    if (this.currentState) {
      this.currentState.update(this, dt, hero);
    }
    // Arena bounds
    this.x = Math.max(30, Math.min(1250, this.x));
  }

  takeDamage(amount, knockbackDir = 0, knockbackPower = 0) {
    if (this.isCorpse || this.isDead) return false;
    const damaged = super.takeDamage(amount, knockbackDir, knockbackPower);
    if (!damaged) return false;

    if (this.hp <= 0) {
      this.hp = 0;
      this.isDead = true;
      if (this.engine) {
        this.engine.onEnemyKilled(this);
      }
      this.onDeath();
    } else {
      this.onHurt();
    }
    return true;
  }

  onHurt() {}
  onDeath() {}

  markForRemoval() {
    this.shouldRemove = true;
  }
}
