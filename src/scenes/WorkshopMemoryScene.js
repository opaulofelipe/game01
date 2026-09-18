import { W, H, C } from "../config/constants.js";
import BaseScene from "./BaseScene.js";
import GameData from "../systems/GameData.js";
import { SAVE, saveGame, resetSave, markInspected } from "../systems/SaveSystem.js";
import { dist, coreStoryComplete, storyProgress } from "../utils/helpers.js";

export default class WorkshopMemoryScene extends BaseScene {
  constructor() {
    super("WorkshopMemoryScene");
    this.phase = 0;
    this.nearFather = false;
    this.nearBench = false;
  }

  create() {
    this.physics.world.setBounds(0, 0, W, H);
    this.drawWorkshopMemory();
    this.bindMovementKeys();
    this.createUI("MUITOS ANOS ATRÁS");

    this.player = this.physics.add.sprite(245, 405, "danielChild");
    this.player.body.setSize(17, 18).setOffset(5, 12);
    this.player.setCollideWorldBounds(true);

    this.father = this.physics.add.sprite(575, 280, "antonio");
    this.father.setImmovable(true);
    this.physics.add.collider(this.player, this.father);

    [
      [480, 22, 960, 44],
      [480, 520, 960, 40],
      [24, 270, 48, 540],
      [936, 270, 48, 540],
      [565, 230, 305, 82],
      [745, 410, 170, 90],
    ].forEach(o => this.physics.add.collider(this.player, this.makeObstacle(...o)));

    this.time.delayedCall(500, () => {
      this.showDataDialogue("workshopmemory_antes_de_saber_os_nomes_das_ferrame_01", () => this.setObjective("Aproxime-se de Antônio."));
    });

    this.cameras.main.fadeIn(750, 84, 69, 50);
  }

  drawWorkshopMemory() {
    const g = this.add.graphics();
    g.fillStyle(0x4b4438, 1);
    g.fillRect(0, 0, W, H);

    // oficina antiga, mais quente e incompleta
    g.fillStyle(0x817967, 1);
    g.fillRect(30, 30, 900, 480);
    for (let i = 0; i < 22; i++) {
      g.fillStyle(0x6b6558, 0.18);
      g.fillEllipse(60 + ((i * 151) % 830), 70 + ((i * 71) % 400), 42, 18);
    }

    g.fillStyle(0x3f3931, 1);
    g.fillRect(20, 20, 920, 20);
    g.fillRect(20, 20, 20, 500);
    g.fillRect(920, 20, 20, 500);
    g.fillRect(20, 500, 920, 20);

    // bancada da memória
    g.fillStyle(0x574536, 1);
    g.fillRoundedRect(412, 185, 305, 82, 7);
    g.fillStyle(0x806a52, 1);
    g.fillRect(412, 185, 305, 15);

    // objeto sendo montado
    g.fillStyle(0x4d4b47, 1);
    g.fillRoundedRect(508, 208, 72, 30, 6);
    g.lineStyle(4, 0x363431, 1);
    g.lineBetween(580, 222, 620, 205);
    g.fillStyle(0xb39267, 1);
    g.fillCircle(621, 205, 5);

    // painel difuso ao fundo
    g.fillStyle(0x615848, 1);
    g.fillRect(105, 75, 175, 140);
    g.lineStyle(4, 0x3d3934, 0.85);
    g.lineBetween(145, 100, 145, 168);
    g.lineBetween(195, 100, 215, 155);
    g.lineBetween(215, 100, 195, 155);

    // bancada lateral
    g.fillStyle(0x514235, 1);
    g.fillRoundedRect(675, 365, 170, 85, 7);

    // luz quente localizada
    this.add.circle(570, 242, 155, 0xe0b66e, 0.07).setDepth(0);

    this.add.text(88, 290, "Algumas lembranças voltam pelas mãos antes de voltar pela cabeça.", {
      fontFamily: "Georgia, serif",
      fontSize: "16px",
      fontStyle: "italic",
      color: "#c5b79d",
      wordWrap: { width: 260 }
    }).setAlpha(0.78);
  }

  update() {
    if (!this.player) return;

    const v = this.controlsVector();
    this.player.setVelocity(v.x * 132, v.y * 132);

    if (this.dialog.isOpen()) {
      this.hidePrompt();
      return;
    }

    this.nearFather = dist(this.player, this.father) < 82;
    this.nearBench = Phaser.Math.Distance.Between(this.player.x, this.player.y, 480, 300) < 95;

    if (this.phase === 0 && this.nearFather) this.showPrompt("E  •  ajudar");
    else if (this.phase === 1 && this.nearBench) this.showPrompt("E  •  segurar a peça");
    else this.hidePrompt();
  }

  handleAction() {
    if (this.dialog?.isOpen()) return super.handleAction();

    if (this.phase === 0 && this.nearFather) {
      this.phase = 1;
      this.showDataDialogue("workshopmemory_antonio_02", () => this.setObjective("Segure a peça na bancada."));
      return;
    }

    if (this.phase === 1 && this.nearBench) {
      this.phase = 2;
      this.player.setVelocity(0);
      this.showDataDialogue("workshopmemory_antonio_03", () => this.finishMemory());
    }
  }

  finishMemory() {
    SAVE.workshopMemorySeen = true;
    saveGame();
    this.cameras.main.fadeOut(900, 84, 69, 50);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.returnFromMemory("workshop");
    });
  }
}