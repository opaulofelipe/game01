import { W, H, C } from "../config/constants.js";
import BaseScene from "./BaseScene.js";
import GameData from "../systems/GameData.js";
import { SAVE, saveGame, resetSave, markInspected } from "../systems/SaveSystem.js";
import { dist, coreStoryComplete, storyProgress } from "../utils/helpers.js";

export default class DinnerMemoryScene extends BaseScene {
  constructor() {
    super("DinnerMemoryScene");
    this.phase = 0;
    this.nearTable = false;
  }

  create() {
    this.physics.world.setBounds(0, 0, W, H);
    this.drawMemoryKitchen();
    this.bindMovementKeys();
    this.createUI("ANOS ATRÁS");

    this.player = this.physics.add.sprite(205, 405, "danielTeen");
    this.player.body.setSize(18, 20).setOffset(5, 12);
    this.player.setCollideWorldBounds(true);

    this.father = this.physics.add.sprite(575, 280, "antonio");
    this.father.setImmovable(true);

    [
      [480, 22, 960, 44],
      [480, 520, 960, 40],
      [24, 270, 48, 540],
      [936, 270, 48, 540],
      [490, 310, 250, 112],
      [720, 112, 260, 90],
    ].forEach(o => this.physics.add.collider(this.player, this.makeObstacle(...o)));

    this.time.delayedCall(500, () => {
      this.showDataDialogue("dinnermemory_voce_chega_tarde_a_casa_esta_quase__01", () => this.setObjective("Sente-se à mesa."));
    });

    this.cameras.main.fadeIn(750, 84, 69, 50);
  }

  drawMemoryKitchen() {
    const g = this.add.graphics();
    g.fillStyle(0x4f473b, 1);
    g.fillRect(0, 0, W, H);

    // cozinha noturna simplificada
    g.fillStyle(0x756957, 1);
    g.fillRect(30, 30, 900, 480);

    for (let y = 30; y < 510; y += 50) {
      for (let x = 30; x < 930; x += 50) {
        g.fillStyle(((x + y) / 50) % 2 === 0 ? 0x807462 : 0x786c5b, 0.75);
        g.fillRect(x, y, 50, 50);
      }
    }

    // bancada em sombra
    g.fillStyle(0x463d34, 1);
    g.fillRoundedRect(590, 65, 260, 90, 7);

    // mesa iluminada
    g.fillStyle(0x59483a, 1);
    g.fillRoundedRect(365, 255, 250, 112, 10);
    g.fillStyle(0xd8cdbd, 1);
    g.fillCircle(472, 310, 32);
    g.fillStyle(0x7e7060, 1);
    g.fillCircle(472, 310, 20);
    g.fillStyle(0xd1b585, 0.08);
    g.fillCircle(490, 305, 165);

    // janela escura
    g.fillStyle(0x22272a, 1);
    g.fillRect(90, 70, 190, 100);
    g.lineStyle(3, 0x8a7c68, 0.55);
    g.strokeRect(90, 70, 190, 100);
    g.lineBetween(185, 70, 185, 170);

    this.add.text(120, 210, "A memória tem menos detalhes do que você gostaria.", {
      fontFamily: "Georgia, serif",
      fontSize: "16px",
      fontStyle: "italic",
      color: "#b9a98f",
    }).setAlpha(0.75);
  }

  update() {
    if (!this.player) return;

    const v = this.controlsVector();
    this.player.setVelocity(v.x * 132, v.y * 132);

    if (this.dialog.isOpen()) {
      this.hidePrompt();
      return;
    }

    this.nearTable = Phaser.Math.Distance.Between(this.player.x, this.player.y, 420, 388) < 85;
    if (this.phase === 0 && this.nearTable) this.showPrompt("E  •  sentar");
    else this.hidePrompt();
  }

  handleAction() {
    if (this.dialog?.isOpen()) return super.handleAction();

    if (this.phase === 0 && this.nearTable) {
      this.phase = 1;
      this.player.setVelocity(0);
      this.showDataDialogue("dinnermemory_antonio_02", () => this.finishMemory());
    }
  }

  finishMemory() {
    SAVE.dinnerMemorySeen = true;
    saveGame();
    this.cameras.main.fadeOut(900, 84, 69, 50);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.returnFromMemory("dinner");
    });
  }
}