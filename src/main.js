import { gameConfig } from "./config/gameConfig.js";
import { bindTouchControls } from "./ui/TouchControls.js";
import { initUIOverlay } from "./ui/UIOverlay.js";

const game = new Phaser.Game(gameConfig);
bindTouchControls(game);
initUIOverlay(game);

document.getElementById("pause-btn")?.addEventListener("click", () => {
  const scene = game.scene.getScenes(true).at(-1);
  if (scene && scene.scene.key !== "TitleScene") window.ACasaUI?.openPause(scene);
});

export default game;