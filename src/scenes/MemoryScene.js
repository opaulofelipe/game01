import { W, H, C } from "../config/constants.js";
import BaseScene from "./BaseScene.js";
import GameData from "../systems/GameData.js";
import { SAVE, saveGame, resetSave, markInspected } from "../systems/SaveSystem.js";
import { dist, coreStoryComplete, storyProgress } from "../utils/helpers.js";

export default class MemoryScene extends BaseScene {
  constructor() {
    super("MemoryScene");
    this.phase = 0;
    this.nearFather = false;
    this.carTriggerUsed = false;
  }

  create() {
    this.physics.world.setBounds(0, 0, W, H);
    this.drawMemory();
    this.bindMovementKeys();
    this.createUI("VERÃO DE 2004");

    this.player = this.physics.add.sprite(310, 410, "danielChild");
    this.player.body.setSize(17, 18).setOffset(5, 12);
    this.player.setCollideWorldBounds(true);

    this.father = this.physics.add.sprite(585, 315, "antonio");
    this.father.setImmovable(true);
    this.physics.add.collider(this.player, this.father);

    // rua / limites simples
    [
      [480, 30, 960, 50],
      [25, 270, 50, 540],
      [935, 270, 50, 540],
      [480, 520, 960, 40],
      [700, 365, 170, 88], // carro
    ].forEach(o => this.physics.add.collider(this.player, this.makeObstacle(...o)));

    this.time.delayedCall(600, () => {
      this.showDataDialogue("memory_o_calor_do_asfalto_o_banco_do_carro_01", () => this.setObjective("Aproxime-se de Antônio."));
    });

    this.cameras.main.fadeIn(800, 87, 72, 52);
  }

  drawMemory() {
    const g = this.add.graphics();

    g.fillStyle(0xa89067, 1);
    g.fillRect(0, 0, W, H);

    // céu/vegetação simbólicos vistos em top-down
    g.fillStyle(0x7e805d, 1);
    g.fillRect(0, 0, W, 190);
    for (let i = 0; i < 28; i++) {
      g.fillStyle(i % 2 ? 0x6f7452 : 0x848565, 0.75);
      g.fillCircle(Phaser.Math.Between(0, W), Phaser.Math.Between(20, 180), Phaser.Math.Between(10, 28));
    }

    // estrada/estacionamento
    g.fillStyle(0x6d6658, 1);
    g.fillRect(0, 185, W, 355);

    // linha da estrada
    g.lineStyle(4, 0xd0bd8c, 0.45);
    for (let x = 50; x < W; x += 90) {
      g.lineBetween(x, 470, x + 48, 470);
    }

    // carro
    g.fillStyle(0x625c52, 1);
    g.fillRoundedRect(620, 324, 170, 82, 18);
    g.fillStyle(0x383a38, 1);
    g.fillRoundedRect(650, 335, 90, 30, 8);
    g.fillStyle(0x33302b, 1);
    g.fillCircle(650, 406, 15);
    g.fillCircle(760, 406, 15);
    g.fillStyle(0x8e8067, 0.7);
    g.fillRect(739, 372, 35, 4);

    // leve vinheta
    const vignette = this.add.graphics();
    vignette.fillStyle(0x362e23, 0.10);
    vignette.fillRect(0, 0, W, 55);
    vignette.fillRect(0, H - 55, W, 55);
    vignette.fillRect(0, 0, 55, H);
    vignette.fillRect(W - 55, 0, 55, H);

    this.add.text(52, 92, "A lembrança não vem inteira.\nPrimeiro vêm a temperatura e os sons.", {
      fontFamily: "Georgia, serif",
      fontSize: "17px",
      fontStyle: "italic",
      color: "#4e4231",
      lineSpacing: 7,
    }).setAlpha(0.8);
  }

  update() {
    if (!this.player) return;

    const v = this.controlsVector();
    this.player.setVelocity(v.x * 132, v.y * 132);

    if (this.dialog.isOpen()) {
      this.hidePrompt();
      return;
    }

    this.nearFather = dist(this.player, this.father) < 78;

    if (this.phase === 0) {
      if (this.nearFather) this.showPrompt("E  •  falar");
      else this.hidePrompt();
    } else if (this.phase === 1) {
      this.hidePrompt();
      const door = { x: 742, y: 366 };
      if (!this.carTriggerUsed && dist(this.player, door) < 72) {
        this.carTriggerUsed = true;
        this.finishMemory();
      }
    }
  }

  handleAction() {
    if (this.dialog?.isOpen()) return super.handleAction();

    if (this.phase === 0 && this.nearFather) {
      this.showDataDialogue("memory_antonio_02", () => {
        this.phase = 1;
        this.setObjective("Entre no carro.");
      });
    }
  }

  finishMemory() {
    this.player.setVelocity(0);
    this.showDataDialogue("memory_antonio_03", () => {
      SAVE.photoSeen = true;
      saveGame();
      this.cameras.main.fadeOut(950, 87, 72, 52);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.returnFromMemory("car");
      });
    });
  }
}