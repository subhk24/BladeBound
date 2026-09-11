/**
 * UIRenderer: Renders top HUD (5 Lives, HP/Energy bars, Score, Wave)
 * and floating 2-tier bars above enemies (Red HP, Cyan Energy)
 */

export class UIRenderer {
  constructor() {
    this.heartPulse = 0;
  }

  render(ctx, player, enemies, gameState) {
    this.heartPulse += 0.05;

    // 1. Floating 2-tier HUD bars above enemies
    this.renderEnemyBars(ctx, enemies);

    // 2. Top Player HUD
    this.renderTopHUD(ctx, player, gameState);
  }

  renderEnemyBars(ctx, enemies) {
    for (const enemy of enemies) {
      if (enemy.isCorpse || enemy.isDead) continue;

      const barW = enemy.archetype === 'boss' ? 70 : 44;
      const hpBarH = 5;
      const energyBarH = 3;
      const x = Math.round(enemy.x - barW / 2);
      const y = Math.round(enemy.y + enemy.floatingBarOffsetY);

      // Bar Background frame
      ctx.fillStyle = 'rgba(10, 10, 15, 0.85)';
      ctx.fillRect(x - 2, y - 2, barW + 4, hpBarH + energyBarH + 5);

      // Top Tier: Red HP Bar
      const hpPct = Math.max(0, Math.min(1.0, enemy.hp / enemy.maxHp));
      ctx.fillStyle = '#441111';
      ctx.fillRect(x, y, barW, hpBarH);
      ctx.fillStyle = '#ff2233';
      ctx.fillRect(x, y, Math.round(barW * hpPct), hpBarH);

      // Bottom Tier: Cyan Energy Bar
      const energyPct = Math.max(0, Math.min(1.0, enemy.energy / enemy.maxEnergy));
      const ey = y + hpBarH + 1;
      ctx.fillStyle = '#0a2a3a';
      ctx.fillRect(x, ey, barW, energyBarH);
      ctx.fillStyle = '#00e5ff';
      ctx.fillRect(x, ey, Math.round(barW * energyPct), energyBarH);

      // Border outline
      ctx.strokeStyle = '#22222a';
      ctx.lineWidth = 1;
      ctx.strokeRect(x - 2, y - 2, barW + 4, hpBarH + energyBarH + 5);
    }
  }

  renderTopHUD(ctx, player, gameState) {
    ctx.save();

    // Top HUD panel container
    const panelX = 20;
    const panelY = 15;

    // 1. 5 Lives System (❤️❤️❤️❤️❤️)
    const heartSize = 18;
    const heartGap = 24;
    for (let i = 0; i < 5; i++) {
      const hx = panelX + i * heartGap;
      const hy = panelY;
      const isAlive = i < player.lives;
      const pulse = (isAlive && i === player.lives - 1) ? Math.sin(this.heartPulse * 3) * 2 : 0;

      ctx.save();
      ctx.translate(hx, hy + pulse);
      if (isAlive) {
        ctx.fillStyle = '#ff1a35';
        ctx.shadowColor = '#ff2a4b';
        ctx.shadowBlur = 8;
        this.drawHeart(ctx, 0, 0, heartSize);
      } else {
        ctx.fillStyle = '#3a2025';
        ctx.shadowBlur = 0;
        this.drawHeart(ctx, 0, 0, heartSize);
      }
      ctx.restore();
    }

    // 2. Player HP Bar (Red)
    const hpX = panelX;
    const hpY = panelY + 28;
    const barWidth = 220;
    const barHeight = 16;
    const hpPct = Math.max(0, Math.min(1.0, player.hp / player.maxHp));

    // Outer frame
    ctx.fillStyle = 'rgba(15, 12, 22, 0.9)';
    ctx.fillRect(hpX - 3, hpY - 3, barWidth + 6, barHeight + 6);
    ctx.strokeStyle = '#554466';
    ctx.lineWidth = 2;
    ctx.strokeRect(hpX - 3, hpY - 3, barWidth + 6, barHeight + 6);

    // HP Fill
    ctx.fillStyle = '#4a0d18';
    ctx.fillRect(hpX, hpY, barWidth, barHeight);
    const gradHp = ctx.createLinearGradient(hpX, hpY, hpX, hpY + barHeight);
    gradHp.addColorStop(0, '#ff4d60');
    gradHp.addColorStop(1, '#cc1125');
    ctx.fillStyle = gradHp;
    ctx.fillRect(hpX, hpY, Math.round(barWidth * hpPct), barHeight);

    // HP Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`HP: ${Math.round(player.hp)} / ${player.maxHp}`, hpX + barWidth / 2, hpY + 12);

    // 3. Player Energy Bar (Cyan)
    const enY = hpY + barHeight + 4;
    const enHeight = 10;
    const enPct = Math.max(0, Math.min(1.0, player.energy / player.maxEnergy));

    ctx.fillStyle = 'rgba(15, 12, 22, 0.9)';
    ctx.fillRect(hpX - 3, enY - 3, barWidth + 6, enHeight + 6);
    ctx.strokeStyle = '#224455';
    ctx.lineWidth = 1;
    ctx.strokeRect(hpX - 3, enY - 3, barWidth + 6, enHeight + 6);

    ctx.fillStyle = '#062836';
    ctx.fillRect(hpX, enY, barWidth, enHeight);
    const gradEn = ctx.createLinearGradient(hpX, enY, hpX, enY + enHeight);
    gradEn.addColorStop(0, '#55ffff');
    gradEn.addColorStop(1, '#00b4d8');
    ctx.fillStyle = gradEn;
    ctx.fillRect(hpX, enY, Math.round(barWidth * enPct), enHeight);

    // Stamina ticks (20 energy per combo)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = 1;
    for (let tick = 1; tick < 5; tick++) {
      const tx = hpX + (barWidth / 5) * tick;
      ctx.beginPath();
      ctx.moveTo(tx, enY);
      ctx.lineTo(tx, enY + enHeight);
      ctx.stroke();
    }

    // 4. Center Score, Best & Wave Counter
    const centerX = 640;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px monospace';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 6;
    const bestScore = (gameState.personalBest || 0).toLocaleString();
    ctx.fillText(`SCORE: ${gameState.score.toLocaleString()}  |  BEST: ${bestScore}`, centerX, 30);

    ctx.font = 'bold 13px monospace';
    ctx.fillStyle = '#ffaa00';
    ctx.fillText(`WAVE ${gameState.wave}  •  KILLS: ${gameState.kills}`, centerX, 52);

    // 5. Right Panel: Difficulty Badge & Survival Timer
    const rightX = 1260;
    ctx.textAlign = 'right';
    const mins = Math.floor(gameState.survivalTime / 60);
    const secs = Math.floor(gameState.survivalTime % 60);
    const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    ctx.font = 'bold 18px monospace';
    ctx.fillStyle = '#00ffcc';
    ctx.fillText(`TIME: ${timeStr}`, rightX, 30);

    const diffColors = { easy: '#2ecc71', medium: '#f1c40f', hard: '#e74c3c' };
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = diffColors[gameState.difficulty] || '#ffffff';
    ctx.fillText(`DIFFICULTY: ${gameState.difficulty.toUpperCase()}`, rightX, 50);

    // 6. Combo Streak Banner
    if (player.comboCount >= 2) {
      ctx.textAlign = 'left';
      ctx.font = 'italic bold 20px monospace';
      ctx.fillStyle = '#ffcc00';
      ctx.shadowColor = '#ff6600';
      ctx.shadowBlur = 8;
      const comboText = `COMBO x${player.comboCount}!`;
      ctx.fillText(comboText, panelX, enY + 36);
    }

    ctx.restore();
  }

  drawHeart(ctx, x, y, size) {
    ctx.beginPath();
    const topCurveHeight = size * 0.3;
    ctx.moveTo(x, y + topCurveHeight);
    // Top left curve
    ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
    // Bottom left curve
    ctx.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x, y + (size + topCurveHeight) / 2, x, y + size);
    // Bottom right curve
    ctx.bezierCurveTo(x, y + (size + topCurveHeight) / 2, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight);
    // Top right curve
    ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
    ctx.closePath();
    ctx.fill();
  }
}
