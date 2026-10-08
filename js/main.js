import { createPlatformAdapter } from './platform/platform.js';
import { createPlaygamaAdapter } from './platform/playgama.js';
import { createY8Adapter } from './platform/y8.js';
import { createPlayerInterface } from './player/player.js';
import { createBotInterface } from './ai/bot.js';

// The legacy-compatible runtime slices are loaded by index.html in dependency order.
// This module is the single application entry point and only starts the already-built
// runtime once; it does not add platform APIs or networking.
const platform = createPlatformAdapter({
  playgama: createPlaygamaAdapter(),
  y8: createY8Adapter()
});

window.DeepDrop = {
  platform,
  interfaces: {
    player: createPlayerInterface,
    bot: createBotInterface
  }
};

if (typeof window.DeepDropStart !== 'function') {
  throw new Error('Deep Drop runtime did not expose its single start path.');
}

window.DeepDropStart();
