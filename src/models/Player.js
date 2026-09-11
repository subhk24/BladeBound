/**
 * Hero Player Model managing 5 lives, stamina, 3-phase combos, and 25 states
 */
import { Entity } from './Entity.js';
import { PLAYER_CONFIG } from '../config/player_sprite_config.js';
import {
  HeroIdle1State, HeroIdle2State, HeroIdle3State, HeroIdle4State, HeroIdle5State, HeroIdle6State,
  HeroRun1State, HeroRun2State, HeroRun3State, HeroRun4State, HeroRun5State, HeroRun6State, HeroRun7State, HeroRun8State,
  HeroAttack1State, HeroAttack2State, HeroAttack3State, HeroAttack4State, HeroAttack5State, HeroAttack6State,
  HeroHurt1State, HeroHurt2State, HeroHurt3State,
  HeroDefeatAlmostFallenState, HeroDefeatFallenState
} from './states/index.js';

export class Player extends Entity {
  constructor(x, y, character = 'hero_female', maxHp = 100) {
    super(x, y, maxHp, PLAYER_CONFIG.MAX_ENERGY);
    this.character = character; // 'hero_female' or 'hero_male'
    this.lives = PLAYER_CONFIG.MAX_LIVES;
    this.energyRegenRate = PLAYER_CONFIG.ENERGY_REGEN_RATE;

    this.isDodgeRolling = false;
    this.dodgeTimer = 0;
    this.comboCount = 0;
    this.comboTimer = 0;

    // Register all 25 Hero States
    const stateList = [
      new HeroIdle1State(), new HeroIdle2State(), new HeroIdle3State(),
      new HeroIdle4State(), new HeroIdle5State(), new HeroIdle6State(),
      new HeroRun1State(), new HeroRun2State(), new HeroRun3State(), new HeroRun4State(),
      new HeroRun5State(), new HeroRun6State(), new HeroRun7State(), new HeroRun8State(),
      new HeroAttack1State(), new HeroAttack2State(),
      new HeroAttack3State(), new HeroAttack4State(),
      new HeroAttack5State(), new HeroAttack6State(),
      new HeroHurt1State(), new HeroHurt2State(), new HeroHurt3State(),
      new HeroDefeatAlmostFallenState(), new HeroDefeatFallenState()
    ];

    for (const st of stateList) {
      this.states.set(st.name, st);
    }

    this.changeState('IDLE_1');
  }

  update(dt, input) {
    super.update(dt);

    // Dodge roll countdown
    if (this.dodgeTimer > 0) {
      this.dodgeTimer -= dt;
      this.x += this.facing * 340 * dt;
      if (this.dodgeTimer <= 0) {
        this.isDodgeRolling = false;
        this.isInvulnerable = false;
        this.changeState('IDLE_1');
      }
    }

    // Combo streak decay
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.comboCount = 0;
      }
    }

    // Update active state
    if (this.currentState) {
      this.currentState.update(this, dt, input);
    }

    // Check boundary constraints (keep within arena: x in [40, 1240])
    this.x = Math.max(40, Math.min(1240, this.x));
  }

  takeDamage(amount, knockbackDir = 0, knockbackPower = 0) {
    if (this.isInvulnerable || this.isDead || this.currentState?.name.startsWith('DEFEAT')) {
      return false;
    }

    const wasDamaged = super.takeDamage(amount, knockbackDir, knockbackPower);
    if (!wasDamaged) return false;

    // Reset combo streak on hit taken
    this.comboCount = 0;

    if (this.hp <= 0) {
      // Enter Defeat Sequence
      this.changeState('DEFEAT_ALMOST_FALLEN');
    } else {
      // Flinch
      this.changeState('HURT_1');
    }
    return true;
  }

  performDodge() {
    if (this.isDodgeRolling || this.energy < PLAYER_CONFIG.ROLL_ENERGY_COST) return;
    this.energy -= PLAYER_CONFIG.ROLL_ENERGY_COST;
    this.isDodgeRolling = true;
    this.isInvulnerable = true;
    this.dodgeTimer = PLAYER_CONFIG.ROLL_INVULNERABILITY_SECONDS;
    this.playSound('hero_lunge');
    this.spawnDashTrail();
  }

  handleLifeLoss() {
    this.lives -= 1;
    this.playSound('life_lost');

    if (this.engine) {
      this.engine.onLifeChanged(this.lives);
    }

    if (this.lives > 0) {
      // Respawn with 1.0s invulnerability recovery
      this.hp = this.maxHp;
      this.energy = this.maxEnergy;
      this.isInvulnerable = true;
      this.invulnerabilityTimer = PLAYER_CONFIG.RESPAWN_INVULNERABILITY_SECONDS;
      this.playSound('hero_respawn');
      this.changeState('IDLE_1');
    } else {
      // 0 Lives remaining -> Lock inputs and trigger Game Over
      this.isDead = true;
      if (this.engine) {
        this.engine.onGameOver();
      }
    }
  }

  registerComboHit() {
    this.comboCount += 1;
    this.comboTimer = 2.2; // 2.2s combo window
  }

  spawnDust() {
    if (this.engine) {
      this.engine.spawnDust(this.x - this.facing * 15, this.y);
    }
  }

  spawnDashTrail() {
    if (this.engine) {
      this.engine.spawnDashTrail(this.x, this.y, this.facing, this.character, this.currentState?.name);
    }
  }

  spawnShockwave(x, y) {
    if (this.engine) {
      this.engine.spawnShockwave(x, y, 120, '#ff9900');
    }
  }

  getDefaultHurtbox() {
    const hb = PLAYER_CONFIG.HURTBOX;
    return {
      x: this.x + hb.offsetX,
      y: this.y + hb.offsetY,
      width: hb.width,
      height: hb.height
    };
  }
}
