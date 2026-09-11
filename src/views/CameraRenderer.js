/**
 * CameraRenderer: Handles screen shake, hit-stop frame freeze, and viewport translation
 */

export class CameraRenderer {
  constructor() {
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.shakeElapsed = 0;
    this.offsetX = 0;
    this.offsetY = 0;

    this.hitStopFrames = 0;
  }

  shake(intensity, duration = 0.2) {
    // Take strongest shake if already shaking
    if (intensity >= this.shakeIntensity) {
      this.shakeIntensity = intensity;
      this.shakeDuration = duration;
      this.shakeElapsed = 0;
    }
  }

  hitStop(frames = 3) {
    this.hitStopFrames = Math.max(this.hitStopFrames, frames);
  }

  update(dt) {
    // Update screen shake
    if (this.shakeElapsed < this.shakeDuration) {
      this.shakeElapsed += dt;
      const progress = this.shakeElapsed / this.shakeDuration;
      const damp = 1.0 - progress;
      const currentIntensity = this.shakeIntensity * damp;
      this.offsetX = (Math.random() * 2 - 1) * currentIntensity;
      this.offsetY = (Math.random() * 2 - 1) * currentIntensity;
    } else {
      this.shakeIntensity = 0;
      this.offsetX = 0;
      this.offsetY = 0;
    }
  }

  apply(ctx) {
    ctx.save();
    ctx.translate(Math.round(this.offsetX), Math.round(this.offsetY));
  }

  restore(ctx) {
    ctx.restore();
  }
}
