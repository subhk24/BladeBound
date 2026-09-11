/**
 * CombatController: AABB Hitbox vs Hurtbox collision testing and resolution
 */

export class CombatController {
  constructor(engine) {
    this.engine = engine;
    this.hitRecord = new Set(); // Prevents multi-hit per swing
    this.lastAttackingState = null;
  }

  checkAABB(b1, b2) {
    if (!b1 || !b2) return false;
    return (
      b1.x < b2.x + b2.width &&
      b1.x + b1.width > b2.x &&
      b1.y < b2.y + b2.height &&
      b1.y + b1.height > b2.y
    );
  }

  update(player, enemies, projectiles) {
    // 1. Reset hit records when state transitions
    if (player.currentState !== this.lastAttackingState) {
      this.hitRecord.clear();
      this.lastAttackingState = player.currentState;
    }

    // 2. Player Hitbox vs Enemies
    const playerHitbox = player.getCurrentHitbox();
    if (playerHitbox) {
      for (const enemy of enemies) {
        if (enemy.isDead || enemy.isCorpse) continue;
        if (this.hitRecord.has(enemy)) continue;

        const enemyHurtbox = enemy.getCurrentHurtbox();
        if (this.checkAABB(playerHitbox, enemyHurtbox)) {
          this.hitRecord.add(enemy);

          const knockbackDir = player.facing;
          const knockbackPower = playerHitbox.comboStep === 2 ? 220 : 120;
          enemy.takeDamage(playerHitbox.damage, knockbackDir, knockbackPower);

          // Hit-stop & feedback
          this.engine.cameraRenderer.hitStop(playerHitbox.comboStep === 3 ? 5 : 3);
          if (playerHitbox.shake > 0) {
            this.engine.cameraRenderer.shake(playerHitbox.shake, 0.2);
          }

          player.registerComboHit();
        }
      }
    }

    // 3. Enemy Hitboxes vs Player
    const playerHurtbox = player.getCurrentHurtbox();
    for (const enemy of enemies) {
      if (enemy.isDead || enemy.isCorpse) continue;

      const enemyHitbox = enemy.getCurrentHitbox();
      if (enemyHitbox && !enemy.currentState?.hasHit) {
        if (this.checkAABB(enemyHitbox, playerHurtbox)) {
          enemy.currentState.hasHit = true;
          const knockbackDir = enemy.facing;
          const knockbackPower = enemyHitbox.shake ? 260 : 140;
          player.takeDamage(enemyHitbox.damage, knockbackDir, knockbackPower);
          this.engine.cameraRenderer.hitStop(4);
          if (enemyHitbox.shake) {
            this.engine.cameraRenderer.shake(enemyHitbox.shake, 0.35);
          }
        }
      }
    }

    // 4. Projectiles vs Player
    for (const proj of projectiles) {
      if (!proj.isAlive || proj.team !== 'enemy') continue;
      const projBounds = proj.getBounds();
      if (this.checkAABB(projBounds, playerHurtbox)) {
        proj.onHit(player);
        player.takeDamage(proj.damage, proj.facing, 80);
      }
    }
  }
}
