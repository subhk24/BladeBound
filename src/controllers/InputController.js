/**
 * InputController: Listens to Keyboard and Touch/Mobile inputs
 */

export class InputController {
  constructor() {
    this.keys = {
      left: false,
      right: false,
      attack: false,
      dodge: false,
      pause: false
    };

    this.attackJustPressed = false;
    this.dodgeJustPressed = false;
    this.pauseJustPressed = false;

    this.initListeners();
  }

  initListeners() {
    window.addEventListener('keydown', (e) => {
      const code = e.code;
      if (code === 'KeyA' || code === 'ArrowLeft') {
        this.keys.left = true;
      } else if (code === 'KeyD' || code === 'ArrowRight') {
        this.keys.right = true;
      } else if (code === 'KeyJ' || code === 'Space' || code === 'KeyZ') {
        if (!this.keys.attack) this.attackJustPressed = true;
        this.keys.attack = true;
      } else if (code === 'KeyK' || code === 'ShiftLeft' || code === 'ShiftRight' || code === 'KeyX') {
        if (!this.keys.dodge) this.dodgeJustPressed = true;
        this.keys.dodge = true;
      } else if (code === 'KeyP' || code === 'Escape') {
        if (!this.keys.pause) this.pauseJustPressed = true;
        this.keys.pause = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      const code = e.code;
      if (code === 'KeyA' || code === 'ArrowLeft') {
        this.keys.left = false;
      } else if (code === 'KeyD' || code === 'ArrowRight') {
        this.keys.right = false;
      } else if (code === 'KeyJ' || code === 'Space' || code === 'KeyZ') {
        this.keys.attack = false;
      } else if (code === 'KeyK' || code === 'ShiftLeft' || code === 'ShiftRight' || code === 'KeyX') {
        this.keys.dodge = false;
      } else if (code === 'KeyP' || code === 'Escape') {
        this.keys.pause = false;
      }
    });
  }

  getInput() {
    const input = {
      left: this.keys.left,
      right: this.keys.right,
      attack: this.attackJustPressed,
      dodge: this.dodgeJustPressed,
      pause: this.pauseJustPressed
    };

    // Reset single-frame triggers
    this.attackJustPressed = false;
    this.dodgeJustPressed = false;
    this.pauseJustPressed = false;

    return input;
  }
}
