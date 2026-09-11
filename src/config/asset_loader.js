/**
 * Asset Loader with Promise-based caching and loading progress tracking
 */
import { IMAGE_MANIFEST } from './image_manifest.js';

export class AssetLoader {
  constructor() {
    this.images = new Map();
    this.sounds = new Map();
    this.audioContext = null;
    this.isAudioMuted = false;
    this.audioVolume = 0.7;
  }

  initAudio() {
    if (!this.audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
      }
    }
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  async loadAll(onProgress = () => {}) {
    const imageList = [];
    for (const category of Object.keys(IMAGE_MANIFEST)) {
      for (const [key, path] of Object.entries(IMAGE_MANIFEST[category])) {
        imageList.push({ category, key, path });
      }
    }

    const audioList = [
      { key: 'hero_slash1', path: './assets/audio/hero_slash1.wav' },
      { key: 'hero_slash2', path: './assets/audio/hero_slash2.wav' },
      { key: 'hero_lunge', path: './assets/audio/hero_lunge.wav' },
      { key: 'hero_slam', path: './assets/audio/hero_slam.wav' },
      { key: 'hero_hurt', path: './assets/audio/hero_hurt.wav' },
      { key: 'hero_defeat', path: './assets/audio/hero_defeat.wav' },
      { key: 'hero_respawn', path: './assets/audio/hero_respawn.wav' },
      { key: 'life_lost', path: './assets/audio/life_lost.wav' },
      { key: 'swarmer_swing', path: './assets/audio/swarmer_swing.wav' },
      { key: 'swarmer_hurt', path: './assets/audio/swarmer_hurt.wav' },
      { key: 'swarmer_dead', path: './assets/audio/swarmer_dead.wav' },
      { key: 'archer_shoot', path: './assets/audio/archer_shoot.wav' },
      { key: 'arrow_hit', path: './assets/audio/arrow_hit.wav' },
      { key: 'boss_charge', path: './assets/audio/boss_charge.wav' },
      { key: 'boss_slam', path: './assets/audio/boss_slam.wav' },
      { key: 'boss_hurt', path: './assets/audio/boss_hurt.wav' },
      { key: 'boss_defeat', path: './assets/audio/boss_defeat.wav' },
      { key: 'ui_click', path: './assets/audio/ui_click.wav' },
      { key: 'game_over', path: './assets/audio/game_over.wav' }
    ];

    const totalAssets = imageList.length + audioList.length;
    let loadedCount = 0;

    const update = () => {
      loadedCount++;
      const progress = Math.min(1.0, loadedCount / totalAssets);
      onProgress(progress);
    };

    // Load Images with timeout safety
    const imagePromises = imageList.map(item => {
      return new Promise((resolve) => {
        const img = new Image();
        const timer = setTimeout(() => {
          console.warn(`Timeout loading image: ${item.path}`);
          update();
          resolve(null);
        }, 3000);

        img.onload = () => {
          clearTimeout(timer);
          this.images.set(`${item.category}_${item.key}`, img);
          update();
          resolve(img);
        };
        img.onerror = () => {
          clearTimeout(timer);
          console.warn(`Failed to load image: ${item.path}`);
          update();
          resolve(null);
        };
        img.src = `${item.path}?v=3`;
      });
    });

    // Load Audio buffers with timeout safety
    const audioPromises = audioList.map(item => {
      return new Promise((resolve) => {
        const controller = new AbortController();
        const timer = setTimeout(() => {
          controller.abort();
          console.warn(`Timeout loading audio: ${item.path}`);
          update();
          resolve();
        }, 3000);

        fetch(`${item.path}?v=3`, { signal: controller.signal })
          .then(res => {
            clearTimeout(timer);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.arrayBuffer();
          })
          .then(buffer => {
            this.sounds.set(item.key, buffer);
            update();
            resolve();
          })
          .catch(err => {
            clearTimeout(timer);
            console.warn(`Failed to load sound: ${item.path}`, err);
            update();
            resolve();
          });
      });
    });

    await Promise.all([...imagePromises, ...audioPromises]);
  }

  getImage(category, key) {
    return this.images.get(`${category}_${key}`) || null;
  }

  playSound(soundKey, volumeMultiplier = 1.0) {
    if (this.isAudioMuted) return;
    this.initAudio();
    if (!this.audioContext) return;

    const buffer = this.sounds.get(soundKey);
    if (!buffer) return;

    // Decode and play buffer asynchronously
    this.audioContext.decodeAudioData(buffer.slice(0))
      .then(decodedBuffer => {
        const source = this.audioContext.createBufferSource();
        source.buffer = decodedBuffer;
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = Math.max(0, Math.min(1.0, this.audioVolume * volumeMultiplier));
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        source.start(0);
      })
      .catch(() => {});
  }

  toggleMute() {
    this.isAudioMuted = !this.isAudioMuted;
    return this.isAudioMuted;
  }
}
