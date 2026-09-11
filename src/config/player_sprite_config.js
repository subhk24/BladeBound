/**
 * Player combat configuration & sprite frame specs
 */

export const PLAYER_CONFIG = {
  MAX_LIVES: 5,
  MAX_ENERGY: 100,
  ENERGY_REGEN_RATE: 15.0, // Energy per second
  RESPAWN_INVULNERABILITY_SECONDS: 1.0,
  ROLL_ENERGY_COST: 15,
  ROLL_INVULNERABILITY_SECONDS: 0.35,

  // Speed
  MOVE_SPEED: 260, // px per second

  // Combos
  COMBOS: {
    PHASE_1: {
      damage: 15,
      energyCost: 20,
      forwardBurst: 0,
      shakeIntensity: 0,
      hitboxWidth: 70,
      hitboxHeight: 65,
      sound: 'hero_slash1'
    },
    PHASE_2: {
      damage: 25,
      energyCost: 20,
      forwardBurst: 8.0, // +8px burst impulse
      shakeIntensity: 2,
      hitboxWidth: 85,
      hitboxHeight: 65,
      sound: 'hero_lunge'
    },
    PHASE_3: {
      damage: 40,
      energyCost: 30,
      forwardBurst: 4.0,
      shakeIntensity: 6, // Screen shake 6
      hitboxWidth: 100,
      hitboxHeight: 80,
      sound: 'hero_slam'
    }
  },

  // Base Hurtbox (body hit detection)
  HURTBOX: {
    width: 38,
    height: 70,
    offsetX: -19,
    offsetY: -70
  }
};
