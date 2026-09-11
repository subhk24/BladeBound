/**
 * SpriteRenderer: Draws background, animated sprites per state, projectiles, and particle VFX
 */

export class SpriteRenderer {
  constructor(assetLoader) {
    this.assetLoader = assetLoader;
    this.particles = [];
    this.damagePopups = [];
    this.dashTrails = [];
    this.shockwaves = [];
  }

  renderBackground(ctx, width, height) {
    const bgImg = this.assetLoader.getImage('background', 'ARENA');
    if (bgImg) {
      ctx.drawImage(bgImg, 0, 0, width, height);
    } else {
      ctx.fillStyle = '#181220';
      ctx.fillRect(0, 0, width, height);
    }
  }

  renderEntity(ctx, entity) {
    if (!entity.currentState) return;

    // Invulnerability blinking effect
    if (entity.isInvulnerable && Math.floor(Date.now() / 70) % 2 === 0) {
      return;
    }

    const category = entity.character || entity.archetype;
    const stateKey = entity.currentState.animationKey || entity.currentState.name;
    const img = this.assetLoader.getImage(category, stateKey);

    if (!img) return;

    ctx.save();
    ctx.translate(Math.round(entity.x), Math.round(entity.y));

    // Flip if facing left
    if (entity.facing === -1) {
      ctx.scale(-1, 1);
    }

    // Draw sprite anchored at bottom center
    const w = img.width;
    const h = img.height;
    ctx.drawImage(img, -Math.round(w / 2), -h, w, h);

    ctx.restore();
  }

  renderProjectile(ctx, proj) {
    const img = this.assetLoader.getImage('archer', 'ARROW');
    ctx.save();
    ctx.translate(Math.round(proj.x), Math.round(proj.y));
    if (proj.facing === -1) {
      ctx.scale(-1, 1);
    }
    if (img) {
      ctx.drawImage(img, -Math.round(proj.width / 2), -Math.round(proj.height / 2), proj.width, proj.height);
    } else {
      ctx.fillStyle = '#ffaa33';
      ctx.fillRect(-proj.width / 2, -proj.height / 2, proj.width, proj.height);
    }
    ctx.restore();
  }

  addDust(x, y) {
    for (let i = 0; i < 4; i++) {
      this.particles.push({
        x: x + (Math.random() * 8 - 4),
        y: y - (Math.random() * 4),
        vx: (Math.random() * 20 - 10),
        vy: -(Math.random() * 15 + 5),
        radius: Math.random() * 3 + 2,
        color: 'rgba(180, 170, 160, ',
        alpha: 0.7,
        decay: 1.8
      });
    }
  }

  addBlood(x, y, dir = 0) {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x,
        y,
        vx: (dir * (Math.random() * 70 + 30)) + (Math.random() * 40 - 20),
        vy: -(Math.random() * 80 + 30),
        radius: Math.random() * 2.5 + 1.5,
        color: 'rgba(210, 20, 20, ',
        alpha: 0.9,
        decay: 1.6,
        gravity: 280
      });
    }
  }

  addSpark(x, y) {
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() * 120 - 60),
        vy: (Math.random() * 120 - 60),
        radius: Math.random() * 2 + 1,
        color: 'rgba(255, 230, 80, ',
        alpha: 1.0,
        decay: 3.0
      });
    }
  }

  addShockwave(x, y, maxRadius = 120, color = '#ff9900') {
    this.shockwaves.push({
      x,
      y,
      radius: 5,
      maxRadius,
      color,
      alpha: 0.85,
      speed: 380
    });
  }

  addDashTrail(x, y, facing, category, stateKey) {
    const img = this.assetLoader.getImage(category, stateKey);
    if (img) {
      this.dashTrails.push({
        img,
        x,
        y,
        facing,
        alpha: 0.5,
        decay: 2.2
      });
    }
  }

  addDamagePopup(x, y, text, isCritical = false) {
    this.damagePopups.push({
      x: x + (Math.random() * 16 - 8),
      y: y + (Math.random() * 10 - 5),
      text: `${text}`,
      isCritical,
      alpha: 1.0,
      scale: isCritical ? 1.4 : 1.0,
      vy: -65
    });
  }

  update(dt) {
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.gravity) p.vy += p.gravity * dt;
      p.alpha -= p.decay * dt;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += sw.speed * dt;
      sw.alpha = 1.0 - (sw.radius / sw.maxRadius);
      if (sw.radius >= sw.maxRadius || sw.alpha <= 0) {
        this.shockwaves.splice(i, 1);
      }
    }

    // Update dash trails
    for (let i = this.dashTrails.length - 1; i >= 0; i--) {
      const tr = this.dashTrails[i];
      tr.alpha -= tr.decay * dt;
      if (tr.alpha <= 0) {
        this.dashTrails.splice(i, 1);
      }
    }

    // Update damage popups
    for (let i = this.damagePopups.length - 1; i >= 0; i--) {
      const pop = this.damagePopups[i];
      pop.y += pop.vy * dt;
      pop.alpha -= 0.95 * dt;
      if (pop.alpha <= 0) {
        this.damagePopups.splice(i, 1);
      }
    }
  }

  renderVFX(ctx) {
    // 1. Dash trails
    for (const tr of this.dashTrails) {
      ctx.save();
      ctx.globalAlpha = tr.alpha;
      ctx.translate(Math.round(tr.x), Math.round(tr.y));
      if (tr.facing === -1) ctx.scale(-1, 1);
      const w = tr.img.width;
      const h = tr.img.height;
      ctx.drawImage(tr.img, -Math.round(w / 2), -h, w, h);
      ctx.restore();
    }

    // 2. Shockwaves
    for (const sw of this.shockwaves) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, sw.alpha);
      ctx.beginPath();
      ctx.ellipse(sw.x, sw.y, sw.radius, sw.radius * 0.35, 0, 0, Math.PI * 2);
      ctx.lineWidth = 4;
      ctx.strokeStyle = sw.color;
      ctx.stroke();
      ctx.restore();
    }

    // 3. Particles
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = `${p.color}${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 4. Floating Damage Popups
    for (const pop of this.damagePopups) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, pop.alpha);
      ctx.font = pop.isCritical ? 'bold 22px monospace' : 'bold 17px monospace';
      ctx.textAlign = 'center';
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#000000';
      ctx.strokeText(pop.text, pop.x, pop.y);
      ctx.fillStyle = pop.isCritical ? '#ff3344' : '#ffea00';
      ctx.fillText(pop.text, pop.x, pop.y);
      ctx.restore();
    }
  }
}
