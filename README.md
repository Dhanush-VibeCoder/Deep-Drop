# Deep Drop

Deep Drop remains the original local Three.js sea battle royale. The refactor extracts the existing HTML, CSS, and sequential runtime slices into the requested directory structure while preserving the original procedural renderer and gameplay paths.

## Run locally

Serve this directory with any static web server and open `index.html`. The game continues to load Three.js r128 from the existing cdnjs URL. A local server is recommended for reliable module loading and pointer-lock behavior.

## Architecture

- `index.html` contains document structure plus stylesheet/script imports only.
- `css/` contains the original visual rules split into common, menu, and mobile files.
- `js/core/` owns runtime setup, persistence, state, the drop sequence, and the loop.
- `js/player/`, `js/ai/`, `js/world/`, `js/combat/`, `js/systems/`, `js/input/`, `js/ui/`, and `js/audio/` contain the extracted gameplay slices and future extraction boundaries.
- `js/platform/` contains inert Playgama/Y8 adapter shapes. No platform SDK is called.
- `assets/` is reserved for future models, textures, audio, and images; no assets were added.
- Desktop `X` and the mobile `SWIM` button toggle the shared continuous-forward swim state. Shift remains sprint.

The classic runtime files are intentionally loaded in the same order as the original single script. This preserves its existing shared runtime scope and avoids changing gameplay behavior during the migration. `js/main.js` is the single guarded start path and exposes only local platform/interface contracts.

## Mobile

The existing touch controls, touch settings, orientation handling, fullscreen call, and `?touch=1` preview behavior are retained.
