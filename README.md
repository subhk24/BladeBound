# BladeBound: 5 Lives Arena

Endless 2D side-scrolling arcade survival combat game built with Vanilla JavaScript (ES6 Modules), HTML5 Canvas API, and FastAPI backend.

## Quick Start
https://subhk24.github.io/BladeBound/

---

## Game Features

* **5 Lives System:** 5 hearts represented in the top HUD. 1-second invulnerability recovery after each defeat.
* **Offline High Score:** Tracks and saves your Personal Best locally in your browser.
* **Quit Option:** Clean quit to title screen from both the Pause menu and Game Over screen.
* **Directions / Help Modal:** Accessible via the "HOW TO PLAY" button on the title screen and pause menu.
* **3-Phase Combo System:**
  * Phase 1 (Hits 1-2): Quick forward slash (15 DMG)
  * Phase 2 (Hits 3-4): Forward dash lunge burst (25 DMG)
  * Phase 3 (Hits 5-6): Overhead ground slam (40 DMG)
* **Controls:**
  * `A` / `D` or `◀` / `▶`: Move
  * `J` or `Space`: Attack (Combo Flurry)
  * `K` or `Shift`: Dodge Roll (Invulnerability)
  * `P` or `ESC`: Pause / Menu

---

## Folder Structure

* `src/`: Core game logic (GameEngine, Player, Enemies, 51 State Pattern classes, Renderers)
* `public/`: HTML5 Canvas UI, retro CRT shaders, audio SFX, background, and character sprites
* `api/`: FastAPI serverless endpoints for static delivery and Vercel compatibility
* `scripts/`: Asset slicing and generation utilities
