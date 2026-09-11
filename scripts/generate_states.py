import os

os.makedirs("src/models/states", exist_ok=True)

# 1. Generate 25 Hero States
hero_idle_template = """import { State } from './State.js';

export class HeroIdle{curr}State extends State {
  constructor() {
    super('IDLE_{curr}', 0.12);
    this.canMove = true;
    this.canAttack = true;
  }

  update(player, dt, input) {
    super.update(player, dt, input);

    if (input.attack && player.energy >= 20) {
      player.changeState('ATTACK_1');
      return;
    }

    if (input.dodge && player.energy >= 15) {
      player.performDodge();
      return;
    }

    if (input.left || input.right) {
      player.changeState('RUN_1');
      return;
    }

    if (this.isComplete()) {
      player.changeState('IDLE_{next_idx}');
    }
  }
}
"""

for i in range(1, 7):
  next_i = (i % 6) + 1
  content = hero_idle_template.replace('{curr}', str(i)).replace('{next_idx}', str(next_i))
  with open(f"src/models/states/HeroIdle{i}State.js", "w") as f:
    f.write(content)

hero_run_template = """import { State } from './State.js';
import { PLAYER_CONFIG } from '../../config/player_sprite_config.js';

export class HeroRun{curr}State extends State {
  constructor() {
    super('RUN_{curr}', 0.08);
    this.canMove = true;
    this.canAttack = true;
  }

  enter(player) {
    super.enter(player);
    // Dust particle kickback on footsteps
    if ({curr} === 2 || {curr} === 6) {
      player.spawnDust();
    }
  }

  update(player, dt, input) {
    super.update(player, dt, input);

    if (input.attack && player.energy >= 20) {
      player.changeState('ATTACK_1');
      return;
    }

    if (input.dodge && player.energy >= 15) {
      player.performDodge();
      return;
    }

    const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    if (dir === 0) {
      player.changeState('IDLE_1');
      return;
    }

    player.facing = dir;
    player.x += dir * PLAYER_CONFIG.MOVE_SPEED * dt;

    if (this.isComplete()) {
      player.changeState('RUN_{next_idx}');
    }
  }
}
"""

for i in range(1, 9):
  next_i = (i % 8) + 1
  content = hero_run_template.replace('{curr}', str(i)).replace('{next_idx}', str(next_i))
  with open(f"src/models/states/HeroRun{i}State.js", "w") as f:
    f.write(content)

# Combo Phase 1: Attack 1 & 2 (15 DMG)
hero_attack1_content = """import { State } from './State.js';
import { PLAYER_CONFIG } from '../../config/player_sprite_config.js';

export class HeroAttack1State extends State {
  constructor() {
    super('ATTACK_1', 0.12);
    this.hasHit = false;
  }

  enter(player) {
    super.enter(player);
    this.hasHit = false;
    player.energy = Math.max(0, player.energy - PLAYER_CONFIG.COMBOS.PHASE_1.energyCost);
    player.playSound(PLAYER_CONFIG.COMBOS.PHASE_1.sound);
  }

  update(player, dt, input) {
    super.update(player, dt, input);
    if (this.isComplete()) {
      player.changeState('ATTACK_2');
    }
  }

  getHitbox(player) {
    const p1 = PLAYER_CONFIG.COMBOS.PHASE_1;
    return {
      x: player.facing === 1 ? player.x + 10 : player.x - 10 - p1.hitboxWidth,
      y: player.y - 65,
      width: p1.hitboxWidth,
      height: p1.hitboxHeight,
      damage: p1.damage,
      shake: p1.shakeIntensity,
      comboStep: 1
    };
  }
}
"""
with open("src/models/states/HeroAttack1State.js", "w") as f: f.write(hero_attack1_content)

hero_attack2_content = """import { State } from './State.js';

export class HeroAttack2State extends State {
  constructor() {
    super('ATTACK_2', 0.14);
    this.bufferedAttack = false;
  }

  enter(player) {
    super.enter(player);
    this.bufferedAttack = false;
  }

  update(player, dt, input) {
    super.update(player, dt, input);
    if (input.attack) {
      this.bufferedAttack = true;
    }

    if (this.isComplete()) {
      if (this.bufferedAttack && player.energy >= 20) {
        player.changeState('ATTACK_3');
      } else {
        player.changeState('IDLE_1');
      }
    }
  }
}
"""
with open("src/models/states/HeroAttack2State.js", "w") as f: f.write(hero_attack2_content)

# Combo Phase 2: Attack 3 & 4 (25 DMG, forward dash lunge +8px burst)
hero_attack3_content = """import { State } from './State.js';
import { PLAYER_CONFIG } from '../../config/player_sprite_config.js';

export class HeroAttack3State extends State {
  constructor() {
    super('ATTACK_3', 0.14);
    this.hasHit = false;
  }

  enter(player) {
    super.enter(player);
    this.hasHit = false;
    player.energy = Math.max(0, player.energy - PLAYER_CONFIG.COMBOS.PHASE_2.energyCost);
    player.playSound(PLAYER_CONFIG.COMBOS.PHASE_2.sound);
    // Forward burst impulse (+8px instantaneous burst + forward velocity)
    player.x += player.facing * PLAYER_CONFIG.COMBOS.PHASE_2.forwardBurst;
    player.vx = player.facing * 180;
    player.spawnDashTrail();
  }

  update(player, dt, input) {
    super.update(player, dt, input);
    player.x += player.vx * dt;
    player.vx *= 0.85;

    if (this.isComplete()) {
      player.changeState('ATTACK_4');
    }
  }

  getHitbox(player) {
    const p2 = PLAYER_CONFIG.COMBOS.PHASE_2;
    return {
      x: player.facing === 1 ? player.x + 15 : player.x - 15 - p2.hitboxWidth,
      y: player.y - 65,
      width: p2.hitboxWidth,
      height: p2.hitboxHeight,
      damage: p2.damage,
      shake: p2.shakeIntensity,
      comboStep: 2
    };
  }
}
"""
with open("src/models/states/HeroAttack3State.js", "w") as f: f.write(hero_attack3_content)

hero_attack4_content = """import { State } from './State.js';

export class HeroAttack4State extends State {
  constructor() {
    super('ATTACK_4', 0.16);
    this.bufferedAttack = false;
  }

  enter(player) {
    super.enter(player);
    this.bufferedAttack = false;
  }

  update(player, dt, input) {
    super.update(player, dt, input);
    if (input.attack) {
      this.bufferedAttack = true;
    }

    if (this.isComplete()) {
      if (this.bufferedAttack && player.energy >= 30) {
        player.changeState('ATTACK_5');
      } else {
        player.changeState('IDLE_1');
      }
    }
  }
}
"""
with open("src/models/states/HeroAttack4State.js", "w") as f: f.write(hero_attack4_content)

# Combo Phase 3: Attack 5 & 6 (40 DMG, high jump downward slam, screen shake 6)
hero_attack5_content = """import { State } from './State.js';
import { PLAYER_CONFIG } from '../../config/player_sprite_config.js';

export class HeroAttack5State extends State {
  constructor() {
    super('ATTACK_5', 0.16);
  }

  enter(player) {
    super.enter(player);
    player.energy = Math.max(0, player.energy - PLAYER_CONFIG.COMBOS.PHASE_3.energyCost);
    // Jump prep / overhead raise
    player.vy = -160;
  }

  update(player, dt, input) {
    super.update(player, dt, input);
    player.y += player.vy * dt;
    player.vy += 400 * dt;

    if (this.isComplete()) {
      player.changeState('ATTACK_6');
    }
  }
}
"""
with open("src/models/states/HeroAttack5State.js", "w") as f: f.write(hero_attack5_content)

hero_attack6_content = """import { State } from './State.js';
import { PLAYER_CONFIG } from '../../config/player_sprite_config.js';

export class HeroAttack6State extends State {
  constructor() {
    super('ATTACK_6', 0.22);
    this.hasHit = false;
  }

  enter(player) {
    super.enter(player);
    this.hasHit = false;
    player.y = player.groundY; // Land slam
    player.vy = 0;
    player.playSound(PLAYER_CONFIG.COMBOS.PHASE_3.sound);
    player.triggerScreenShake(PLAYER_CONFIG.COMBOS.PHASE_3.shakeIntensity, 0.25);
    player.spawnShockwave(player.x + player.facing * 40, player.y);
  }

  update(player, dt, input) {
    super.update(player, dt, input);
    if (this.isComplete()) {
      player.changeState('IDLE_1');
    }
  }

  getHitbox(player) {
    const p3 = PLAYER_CONFIG.COMBOS.PHASE_3;
    return {
      x: player.facing === 1 ? player.x + 10 : player.x - 10 - p3.hitboxWidth,
      y: player.y - 75,
      width: p3.hitboxWidth,
      height: p3.hitboxHeight,
      damage: p3.damage,
      shake: p3.shakeIntensity,
      comboStep: 3
    };
  }
}
"""
with open("src/models/states/HeroAttack6State.js", "w") as f: f.write(hero_attack6_content)

# Hurt States: HURT_1, HURT_2, HURT_3
hero_hurt1_content = """import { State } from './State.js';

export class HeroHurt1State extends State {
  constructor() {
    super('HURT_1', 0.08); // Hit-stop flinch
  }

  enter(player) {
    super.enter(player);
    player.playSound('hero_hurt');
  }

  update(player, dt, input) {
    super.update(player, dt, input);
    if (this.isComplete()) {
      player.changeState('HURT_2');
    }
  }
}
"""
with open("src/models/states/HeroHurt1State.js", "w") as f: f.write(hero_hurt1_content)

hero_hurt2_content = """import { State } from './State.js';

export class HeroHurt2State extends State {
  constructor() {
    super('HURT_2', 0.12); // Knockback slide
  }

  enter(player) {
    super.enter(player);
    player.vx = -player.facing * 180;
  }

  update(player, dt, input) {
    super.update(player, dt, input);
    player.x += player.vx * dt;
    player.vx *= 0.88;

    if (this.isComplete()) {
      player.changeState('HURT_3');
    }
  }
}
"""
with open("src/models/states/HeroHurt2State.js", "w") as f: f.write(hero_hurt2_content)

hero_hurt3_content = """import { State } from './State.js';

export class HeroHurt3State extends State {
  constructor() {
    super('HURT_3', 0.10); // Recovery
  }

  update(player, dt, input) {
    super.update(player, dt, input);
    if (this.isComplete()) {
      player.changeState('IDLE_1');
    }
  }
}
"""
with open("src/models/states/HeroHurt3State.js", "w") as f: f.write(hero_hurt3_content)

# Defeat States: DEFEAT_ALMOST_FALLEN, DEFEAT_FALLEN
hero_defeat_almost_content = """import { State } from './State.js';

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
"""
with open("src/models/states/HeroDefeatAlmostFallenState.js", "w") as f: f.write(hero_defeat_almost_content)

hero_defeat_fallen_content = """import { State } from './State.js';

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
"""
with open("src/models/states/HeroDefeatFallenState.js", "w") as f: f.write(hero_defeat_fallen_content)

# 2. Swarmer Goblin States (9 States)
# Walk 1..4
swarmer_walk_template = """import { State } from './State.js';
import { ENEMY_CONFIG } from '../../config/enemy_sprite_config.js';

export class SwarmerWalk{curr}State extends State {
  constructor() {
    super('WALK_{curr}', 0.10);
  }

  update(enemy, dt, hero) {
    super.update(enemy, dt);
    const dist = hero.x - enemy.x;
    enemy.facing = dist >= 0 ? 1 : -1;

    // Melee pursuit
    if (Math.abs(dist) > 55) {
      enemy.x += enemy.facing * ENEMY_CONFIG.swarmer.moveSpeed * dt;
    } else if (enemy.energy >= ENEMY_CONFIG.swarmer.attackCost) {
      enemy.changeState('WINDUP');
      return;
    }

    if (this.isComplete()) {
      enemy.changeState('WALK_{next_idx}');
    }
  }
}
"""
for i in range(1, 5):
  next_i = (i % 4) + 1
  content = swarmer_walk_template.replace('{curr}', str(i)).replace('{next_idx}', str(next_i))
  with open(f"src/models/states/SwarmerWalk{i}State.js", "w") as f:
    f.write(content)

# Attack: Windup, Swing, Follow
swarmer_atk_content = """import { State } from './State.js';
import { ENEMY_CONFIG } from '../../config/enemy_sprite_config.js';

export class SwarmerWindupState extends State {
  constructor() {
    super('WINDUP', 0.28);
  }

  enter(enemy) {
    super.enter(enemy);
    enemy.energy = Math.max(0, enemy.energy - ENEMY_CONFIG.swarmer.attackCost);
  }

  update(enemy, dt) {
    super.update(enemy, dt);
    if (this.isComplete()) {
      enemy.changeState('SWING');
    }
  }
}
"""
with open("src/models/states/SwarmerWindupState.js", "w") as f: f.write(swarmer_atk_content)

swarmer_swing_content = """import { State } from './State.js';
import { ENEMY_CONFIG } from '../../config/enemy_sprite_config.js';

export class SwarmerSwingState extends State {
  constructor() {
    super('SWING', 0.16);
    this.hasHit = false;
  }

  enter(enemy) {
    super.enter(enemy);
    this.hasHit = false;
    enemy.playSound('swarmer_swing');
  }

  update(enemy, dt) {
    super.update(enemy, dt);
    if (this.isComplete()) {
      enemy.changeState('FOLLOW');
    }
  }

  getHitbox(enemy) {
    const hb = ENEMY_CONFIG.swarmer.hitbox;
    return {
      x: enemy.facing === 1 ? enemy.x + hb.offsetX : enemy.x - hb.offsetX - hb.width,
      y: enemy.y + hb.offsetY,
      width: hb.width,
      height: hb.height,
      damage: ENEMY_CONFIG.swarmer.damage
    };
  }
}
"""
with open("src/models/states/SwarmerSwingState.js", "w") as f: f.write(swarmer_swing_content)

swarmer_follow_content = """import { State } from './State.js';

export class SwarmerFollowState extends State {
  constructor() {
    super('FOLLOW', 0.20);
  }

  update(enemy, dt) {
    super.update(enemy, dt);
    if (this.isComplete()) {
      enemy.changeState('WALK_1');
    }
  }
}
"""
with open("src/models/states/SwarmerFollowState.js", "w") as f: f.write(swarmer_follow_content)

swarmer_hurt_content = """import { State } from './State.js';

export class SwarmerHurtState extends State {
  constructor() {
    super('HURT', 0.18);
  }

  enter(enemy) {
    super.enter(enemy);
    enemy.playSound('swarmer_hurt');
    enemy.vx = -enemy.facing * 140;
  }

  update(enemy, dt) {
    super.update(enemy, dt);
    enemy.x += enemy.vx * dt;
    enemy.vx *= 0.85;

    if (this.isComplete()) {
      enemy.changeState('WALK_1');
    }
  }
}
"""
with open("src/models/states/SwarmerHurtState.js", "w") as f: f.write(swarmer_hurt_content)

swarmer_dead_content = """import { State } from './State.js';

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
"""
with open("src/models/states/SwarmerDeadState.js", "w") as f: f.write(swarmer_dead_content)

# 3. Archer States (10 States)
# Walk 1..3 (Spacing 250px..350px)
archer_walk_template = """import { State } from './State.js';
import { ENEMY_CONFIG } from '../../config/enemy_sprite_config.js';

export class ArcherWalk{curr}State extends State {
  constructor() {
    super('WALK_{curr}', 0.12);
  }

  update(archer, dt, hero) {
    super.update(archer, dt);
    const dist = hero.x - archer.x;
    archer.facing = dist >= 0 ? 1 : -1;
    const absDist = Math.abs(dist);

    if (absDist < ENEMY_CONFIG.archer.spacingMin) {
      // Back away to maintain spacing
      archer.x -= archer.facing * ENEMY_CONFIG.archer.moveSpeed * dt;
    } else if (absDist > ENEMY_CONFIG.archer.spacingMax) {
      // Move closer
      archer.x += archer.facing * ENEMY_CONFIG.archer.moveSpeed * dt;
    } else if (archer.energy >= ENEMY_CONFIG.archer.attackCost && archer.canShoot) {
      archer.changeState('AIM_1');
      return;
    }

    if (this.isComplete()) {
      archer.changeState('WALK_{next_idx}');
    }
  }
}
"""
for i in range(1, 4):
  next_i = (i % 3) + 1
  content = archer_walk_template.replace('{curr}', str(i)).replace('{next_idx}', str(next_i))
  with open(f"src/models/states/ArcherWalk{i}State.js", "w") as f:
    f.write(content)

# Shoot: AIM_1, AIM_2, RELEASE, RECOIL
with open("src/models/states/ArcherAim1State.js", "w") as f:
  f.write("""import { State } from './State.js';
import { ENEMY_CONFIG } from '../../config/enemy_sprite_config.js';

export class ArcherAim1State extends State {
  constructor() {
    super('AIM_1', 0.22);
  }

  enter(archer) {
    super.enter(archer);
    archer.energy = Math.max(0, archer.energy - ENEMY_CONFIG.archer.attackCost);
  }

  update(archer, dt) {
    super.update(archer, dt);
    if (this.isComplete()) {
      archer.changeState('AIM_2');
    }
  }
}
""")

with open("src/models/states/ArcherAim2State.js", "w") as f:
  f.write("""import { State } from './State.js';

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
""")

with open("src/models/states/ArcherReleaseState.js", "w") as f:
  f.write("""import { State } from './State.js';

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
""")

with open("src/models/states/ArcherRecoilState.js", "w") as f:
  f.write("""import { State } from './State.js';

export class ArcherRecoilState extends State {
  constructor() {
    super('RECOIL', 0.20);
  }

  update(archer, dt) {
    super.update(archer, dt);
    if (this.isComplete()) {
      archer.resetShootCooldown();
      archer.changeState('WALK_1');
    }
  }
}
""")

# Death: HURT, STUMBLE, DEAD
with open("src/models/states/ArcherHurtState.js", "w") as f:
  f.write("""import { State } from './State.js';

export class ArcherHurtState extends State {
  constructor() {
    super('HURT', 0.15);
  }

  enter(archer) {
    super.enter(archer);
    archer.playSound('arrow_hit');
    archer.vx = -archer.facing * 120;
  }

  update(archer, dt) {
    super.update(archer, dt);
    archer.x += archer.vx * dt;
    archer.vx *= 0.85;

    if (this.isComplete()) {
      archer.changeState('WALK_1');
    }
  }
}
""")

with open("src/models/states/ArcherStumbleState.js", "w") as f:
  f.write("""import { State } from './State.js';

export class ArcherStumbleState extends State {
  constructor() {
    super('STUMBLE', 0.25);
    this.isInvulnerable = true;
  }

  enter(archer) {
    super.enter(archer);
    archer.vx = -archer.facing * 160;
  }

  update(archer, dt) {
    super.update(archer, dt);
    archer.x += archer.vx * dt;
    archer.vx *= 0.90;

    if (this.isComplete()) {
      archer.changeState('DEAD');
    }
  }
}
""")

with open("src/models/states/ArcherDeadState.js", "w") as f:
  f.write("""import { State } from './State.js';

export class ArcherDeadState extends State {
  constructor() {
    super('DEAD', 0.65);
    this.isInvulnerable = true;
  }

  enter(archer) {
    super.enter(archer);
    archer.isCorpse = true;
  }

  update(archer, dt) {
    super.update(archer, dt);
    if (this.isComplete()) {
      archer.markForRemoval();
    }
  }
}
""")

# 4. Boss States (7 States)
# STANCE
with open("src/models/states/BossStanceState.js", "w") as f:
  f.write("""import { State } from './State.js';
import { ENEMY_CONFIG } from '../../config/enemy_sprite_config.js';

export class BossStanceState extends State {
  constructor() {
    super('STANCE', 0.35);
  }

  update(boss, dt, hero) {
    super.update(boss, dt);
    const dist = hero.x - boss.x;
    boss.facing = dist >= 0 ? 1 : -1;

    if (Math.abs(dist) > 90) {
      boss.x += boss.facing * ENEMY_CONFIG.boss.moveSpeed * dt;
    } else if (boss.energy >= ENEMY_CONFIG.boss.attackCost) {
      boss.changeState('WINDUP');
      return;
    }

    if (this.isComplete()) {
      this.elapsed = 0; // Loop stance movement
    }
  }
}
""")

# Heavy Slam: WINDUP, CHARGE, SLAM
with open("src/models/states/BossWindupState.js", "w") as f:
  f.write("""import { State } from './State.js';
import { ENEMY_CONFIG } from '../../config/enemy_sprite_config.js';

export class BossWindupState extends State {
  constructor() {
    super('WINDUP', 0.40);
  }

  enter(boss) {
    super.enter(boss);
    boss.energy = Math.max(0, boss.energy - ENEMY_CONFIG.boss.attackCost);
    boss.playSound('boss_charge');
  }

  update(boss, dt) {
    super.update(boss, dt);
    if (this.isComplete()) {
      boss.changeState('CHARGE');
    }
  }
}
""")

with open("src/models/states/BossChargeState.js", "w") as f:
  f.write("""import { State } from './State.js';

export class BossChargeState extends State {
  constructor() {
    super('CHARGE', 0.32);
  }

  enter(boss) {
    super.enter(boss);
    boss.spawnChargeAura();
  }

  update(boss, dt) {
    super.update(boss, dt);
    if (this.isComplete()) {
      boss.changeState('SLAM');
    }
  }
}
""")

with open("src/models/states/BossSlamState.js", "w") as f:
  f.write("""import { State } from './State.js';
import { ENEMY_CONFIG } from '../../config/enemy_sprite_config.js';

export class BossSlamState extends State {
  constructor() {
    super('SLAM', 0.45);
    this.hasHit = false;
  }

  enter(boss) {
    super.enter(boss);
    this.hasHit = false;
    boss.playSound('boss_slam');
    // Ground shockwave AoE + screen shake intensity 12
    boss.triggerScreenShake(ENEMY_CONFIG.boss.shakeIntensity, 0.45);
    boss.spawnShockwave(boss.x + boss.facing * 50, boss.y);
  }

  update(boss, dt) {
    super.update(boss, dt);
    if (this.isComplete()) {
      boss.changeState('STANCE');
    }
  }

  getHitbox(boss) {
    const hb = ENEMY_CONFIG.boss.hitbox;
    return {
      x: boss.facing === 1 ? boss.x + hb.offsetX : boss.x - hb.offsetX - hb.width,
      y: boss.y + hb.offsetY,
      width: hb.width,
      height: hb.height,
      damage: ENEMY_CONFIG.boss.damage,
      shake: ENEMY_CONFIG.boss.shakeIntensity
    };
  }
}
""")

# Death: HURT, KNEEL, COLLAPSE
with open("src/models/states/BossHurtState.js", "w") as f:
  f.write("""import { State } from './State.js';

export class BossHurtState extends State {
  constructor() {
    super('HURT', 0.20);
  }

  enter(boss) {
    super.enter(boss);
    boss.playSound('boss_hurt');
    boss.vx = -boss.facing * 60;
  }

  update(boss, dt) {
    super.update(boss, dt);
    boss.x += boss.vx * dt;
    boss.vx *= 0.85;

    if (this.isComplete()) {
      boss.changeState('STANCE');
    }
  }
}
""")

with open("src/models/states/BossKneelState.js", "w") as f:
  f.write("""import { State } from './State.js';

export class BossKneelState extends State {
  constructor() {
    super('KNEEL', 0.50);
    this.isInvulnerable = true;
  }

  enter(boss) {
    super.enter(boss);
    boss.playSound('boss_defeat');
  }

  update(boss, dt) {
    super.update(boss, dt);
    if (this.isComplete()) {
      boss.changeState('COLLAPSE');
    }
  }
}
""")

with open("src/models/states/BossCollapseState.js", "w") as f:
  f.write("""import { State } from './State.js';

export class BossCollapseState extends State {
  constructor() {
    super('COLLAPSE', 1.0);
    this.isInvulnerable = true;
  }

  enter(boss) {
    super.enter(boss);
    boss.isCorpse = true;
  }

  update(boss, dt) {
    super.update(boss, dt);
    if (this.isComplete()) {
      boss.markForRemoval();
    }
  }
}
""")

print("51 Granular State classes created!")
