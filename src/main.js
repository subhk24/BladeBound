/**
 * BladeBound: 5 Lives Arena - Application Bootstrap & DOM Wiring
 * Pure Offline Single-Player Combat Experience
 */
import { AssetLoader } from './config/asset_loader.js';
import { GameEngine } from './controllers/GameEngine.js';

const STORAGE_KEY = 'bladebound_personal_best';

function getPersonalBest() {
  try {
    return parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10) || 0;
  } catch (_) {
    return 0;
  }
}

function savePersonalBest(score) {
  try {
    localStorage.setItem(STORAGE_KEY, String(score));
  } catch (_) {}
}

async function initApp() {
  const canvas = document.getElementById('gameCanvas');
  const loadingOverlay = document.getElementById('loadingOverlay');
  const loadingProgress = document.getElementById('loadingProgress');
  const loadingText = document.getElementById('loadingText');

  // Modals
  const startModal = document.getElementById('startModal');
  const pauseModal = document.getElementById('pauseModal');
  const gameOverModal = document.getElementById('gameOverModal');
  const helpModal = document.getElementById('helpModal');

  // Action Buttons
  const startBtn = document.getElementById('startBtn');
  const restartBtn = document.getElementById('restartBtn');
  const resumeBtn = document.getElementById('resumeBtn');
  const pauseQuitBtn = document.getElementById('pauseQuitBtn');
  const gameOverQuitBtn = document.getElementById('gameOverQuitBtn');
  const openHelpBtn = document.getElementById('openHelpBtn');
  const pauseHelpBtn = document.getElementById('pauseHelpBtn');
  const closeHelpBtn = document.getElementById('closeHelpBtn');
  const audioToggleBtn = document.getElementById('audioToggleBtn');

  // Score & Stat Displays
  const startHighScoreEl = document.getElementById('startHighScore');
  const finalScoreEl = document.getElementById('finalScore');
  const finalHighScoreEl = document.getElementById('finalHighScore');
  const newBestBannerEl = document.getElementById('newBestBanner');
  const finalWaveEl = document.getElementById('finalWave');
  const finalKillsEl = document.getElementById('finalKills');

  let selectedCharacter = 'hero_female';
  let selectedDifficulty = 'medium';

  // Helper to refresh start screen high score
  function refreshStartHighScore() {
    const pb = getPersonalBest();
    if (startHighScoreEl) {
      startHighScoreEl.textContent = pb.toLocaleString();
    }
  }

  // Initial High Score display on title screen
  refreshStartHighScore();

  // Character selection cards
  const charCards = document.querySelectorAll('.char-card');
  charCards.forEach(card => {
    card.addEventListener('click', () => {
      charCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedCharacter = card.dataset.character;
    });
  });

  // Difficulty selector tabs
  const diffBtns = document.querySelectorAll('.diff-btn');
  diffBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      diffBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedDifficulty = btn.dataset.diff;
    });
  });

  // Initialize Assets and Engine
  const assetLoader = new AssetLoader();
  const engine = new GameEngine(canvas, assetLoader);

  // Audio Toggle
  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      const isMuted = assetLoader.toggleMute();
      audioToggleBtn.textContent = isMuted ? '🔇' : '🔊';
    });
  }

  // Preload Assets
  try {
    await assetLoader.loadAll((progress) => {
      const pct = Math.round(progress * 100);
      if (loadingProgress) loadingProgress.style.width = `${pct}%`;
      if (loadingText) loadingText.textContent = `PREPARING ARENA ASSETS... ${pct}%`;
    });
  } catch (err) {
    console.error('Asset preloading error:', err);
  }

  // Hide loading screen, reveal Start Modal
  if (loadingOverlay) loadingOverlay.classList.add('hidden');
  if (startModal) startModal.classList.remove('hidden');

  // Start Game
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      startModal.classList.add('hidden');
      assetLoader.playSound('ui_click');
      engine.init(selectedCharacter, selectedDifficulty);
      engine.start();
    });
  }

  // Resume Battle from Pause
  if (resumeBtn) {
    resumeBtn.addEventListener('click', () => {
      engine.togglePause();
    });
  }

  // Quit to Main Menu from Pause
  if (pauseQuitBtn) {
    pauseQuitBtn.addEventListener('click', () => {
      assetLoader.playSound('ui_click');
      engine.quitToTitle();
    });
  }

  // Quit to Main Menu from Game Over
  if (gameOverQuitBtn) {
    gameOverQuitBtn.addEventListener('click', () => {
      assetLoader.playSound('ui_click');
      engine.quitToTitle();
    });
  }

  // Quit To Title Callback in GameEngine
  engine.onQuitToTitleCallback = () => {
    if (pauseModal) pauseModal.classList.add('hidden');
    if (gameOverModal) gameOverModal.classList.add('hidden');
    if (helpModal) helpModal.classList.add('hidden');
    refreshStartHighScore();
    if (startModal) startModal.classList.remove('hidden');
  };

  // Pause Change Callback in GameEngine
  engine.onPauseChangeCallback = (isPaused) => {
    if (isPaused) {
      if (pauseModal) pauseModal.classList.remove('hidden');
    } else {
      if (pauseModal) pauseModal.classList.add('hidden');
      if (helpModal) helpModal.classList.add('hidden');
    }
  };

  // Help / Directions Modal Handlers
  if (openHelpBtn) {
    openHelpBtn.addEventListener('click', () => {
      assetLoader.playSound('ui_click');
      if (helpModal) helpModal.classList.remove('hidden');
    });
  }

  if (pauseHelpBtn) {
    pauseHelpBtn.addEventListener('click', () => {
      assetLoader.playSound('ui_click');
      if (helpModal) helpModal.classList.remove('hidden');
    });
  }

  if (closeHelpBtn) {
    closeHelpBtn.addEventListener('click', () => {
      assetLoader.playSound('ui_click');
      if (helpModal) helpModal.classList.add('hidden');
    });
  }

  // Global Keyboard Listener for Pause / Esc / Help
  window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyP' || e.code === 'Escape') {
      // If help modal is open, close it first
      if (helpModal && !helpModal.classList.contains('hidden')) {
        helpModal.classList.add('hidden');
        return;
      }
      // If game is actively running, toggle pause
      if (engine.gameState.gameStarted && !engine.gameState.isGameOver) {
        engine.togglePause();
      }
    }
  });

  // Game Over Handling
  engine.onGameOverCallback = (results) => {
    const previousBest = getPersonalBest();
    const isNewBest = results.score > previousBest;
    if (isNewBest) {
      savePersonalBest(results.score);
    }
    const currentBest = Math.max(previousBest, results.score);

    if (finalScoreEl) finalScoreEl.textContent = results.score.toLocaleString();
    if (finalHighScoreEl) finalHighScoreEl.textContent = currentBest.toLocaleString();
    if (finalWaveEl) finalWaveEl.textContent = results.wave;
    if (finalKillsEl) finalKillsEl.textContent = results.kills;

    if (newBestBannerEl) {
      if (isNewBest && results.score > 0) {
        newBestBannerEl.classList.remove('hidden');
      } else {
        newBestBannerEl.classList.add('hidden');
      }
    }

    if (gameOverModal) gameOverModal.classList.remove('hidden');
  };

  // Restart Button (Play Again)
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      if (gameOverModal) gameOverModal.classList.add('hidden');
      assetLoader.playSound('ui_click');
      engine.init(selectedCharacter, selectedDifficulty);
      engine.start();
    });
  }

  // Mobile / Touch controls on-screen
  const touchLeft = document.getElementById('touchLeft');
  const touchRight = document.getElementById('touchRight');
  const touchAttack = document.getElementById('touchAttack');
  const touchDodge = document.getElementById('touchDodge');

  if (touchLeft && touchRight && touchAttack && touchDodge) {
    const bindTouch = (elem, keyName) => {
      elem.addEventListener('touchstart', (e) => {
        e.preventDefault();
        engine.inputController.keys[keyName] = true;
        if (keyName === 'attack') engine.inputController.attackJustPressed = true;
        if (keyName === 'dodge') engine.inputController.dodgeJustPressed = true;
      });
      elem.addEventListener('touchend', (e) => {
        e.preventDefault();
        engine.inputController.keys[keyName] = false;
      });
    };
    bindTouch(touchLeft, 'left');
    bindTouch(touchRight, 'right');
    bindTouch(touchAttack, 'attack');
    bindTouch(touchDodge, 'dodge');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

