/**
 * Projectile Entity (Arrow)
 */

export class Projectile {
  constructor(x, y, vx, vy, width = 20, height = 6, damage = 18, team = 'enemy', engine = null) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.width = width;
    this.height = height;
    this.damage = damage;
    this.team = team; // 'enemy' or 'player'
    this.engine = engine;
    this.facing = vx >= 0 ? 1 : -1;
    this.isAlive = true;
    this.lifespan = 3.5; // seconds
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.lifespan -= dt;

    if (this.lifespan <= 0 || this.x < -50 || this.x > 1350) {
      this.isAlive = false;
    }
  }

  getBounds() {
    return {
      x: this.facing === 1 ? this.x : this.x - this.width,
      y: this.y - this.height / 2,
      width: this.width,
      height: this.height
    };
  }

  onHit(target) {
    this.isAlive = false;
    if (this.engine) {
      this.engine.assetLoader?.playSound('arrow_hit');
      this.engine.spawnSpark(this.x, this.y);
    }
  }
}
