/**
 * Base Entity class with kinematics, health, energy, and combat hurtboxes
 */

export class Entity {
  constructor(x, y, maxHp = 100, maxEnergy = 100) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.groundY = y;
    this.facing = 1; // 1: Right, -1: Left

    this.maxHp = maxHp;
    this.hp = maxHp;
    this.maxEnergy = maxEnergy;
    this.energy = maxEnergy;
    this.energyRegenRate = 15.0; // Energy/sec

    this.isDead = false;
    this.isCorpse = false;
    this.isInvulnerable = false;
    this.invulnerabilityTimer = 0;

    this.currentState = null;
    this.states = new Map();
    this.engine = null; // Reference to GameEngine for audio/fx
  }

  changeState(stateName) {
    const next = this.states.get(stateName);
    if (!next) {
      console.warn(`State "${stateName}" not found on entity`, this);
      return;
    }
    if (this.currentState) {
      this.currentState.exit(this);
    }
    this.currentState = next;
    this.currentState.enter(this);
  }

  update(dt) {
    // Passive Energy regeneration
    if (this.energy < this.maxEnergy) {
      this.energy = Math.min(this.maxEnergy, this.energy + this.energyRegenRate * dt);
    }

    // Invulnerability timer countdown
    if (this.invulnerabilityTimer > 0) {
      this.invulnerabilityTimer -= dt;
      if (this.invulnerabilityTimer <= 0) {
        this.isInvulnerable = false;
      }
    }
  }

  takeDamage(amount, knockbackDir = 0, knockbackPower = 0) {
    if (this.isInvulnerable || this.isDead || this.isCorpse) return false;

    this.hp = Math.max(0, this.hp - amount);
    if (knockbackDir !== 0 && knockbackPower > 0) {
      this.vx = knockbackDir * knockbackPower;
    }

    if (this.engine) {
      this.engine.spawnDamageNumber(this.x, this.y - 45, amount, false);
      this.engine.spawnBloodBurst(this.x, this.y - 35, knockbackDir);
    }
    return true;
  }

  getDefaultHurtbox() {
    return {
      x: this.x - 20,
      y: this.y - 65,
      width: 40,
      height: 65
    };
  }

  getCurrentHurtbox() {
    if (this.currentState) {
      return this.currentState.getHurtbox(this);
    }
    return this.getDefaultHurtbox();
  }

  getCurrentHitbox() {
    if (this.currentState) {
      return this.currentState.getHitbox(this);
    }
    return null;
  }

  playSound(soundKey, volume = 1.0) {
    if (this.engine && this.engine.assetLoader) {
      this.engine.assetLoader.playSound(soundKey, volume);
    }
  }

  triggerScreenShake(intensity, duration) {
    if (this.engine && this.engine.cameraRenderer) {
      this.engine.cameraRenderer.shake(intensity, duration);
    }
  }
}
