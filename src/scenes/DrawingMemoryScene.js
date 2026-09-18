import { W, H, C } from "../config/constants.js";
import BaseScene from "./BaseScene.js";
import GameData from "../systems/GameData.js";
import { SAVE, saveGame, resetSave, markInspected } from "../systems/SaveSystem.js";
import { dist, coreStoryComplete, storyProgress } from "../utils/helpers.js";

export default class DrawingMemoryScene extends BaseScene {
  constructor() {
    super("DrawingMemoryScene");
    this.phase = 0;
    this.nearDrawing = false;
    this.nearFather = false;
    this.nearExit = false;
    this.ending = false;
  }

  create() {
    this.physics.world.setBounds(0, 0, W, H);
    this.drawMemoryRoom();
    this.bindMovementKeys();
    this.createUI("MUITOS ANOS ANTES");

    this.player = this.physics.add.sprite(280, 400, "danielChild");
    this.player.body.setSize(17, 18).setOffset(5, 12);
    this.player.setCollideWorldBounds(true);

    this.father = this.physics.add.sprite(630, 260, "antonio");
    this.father.setImmovable(true);
    this.physics.add.collider(this.player, this.father);

    [
      [480, 22, 960, 44], [480, 520, 960, 40], [24, 270, 48, 540], [936, 270, 48, 540],
      [355, 330, 190, 84], [710, 180, 150, 66]
    ].forEach(o => this.physics.add.collider(this.player, this.makeObstacle(...o)));

    this.time.delayedCall(560, () => {
      this.showDataDialogue("drawingmemory_voce_lembra_da_mesa_antes_de_lembra_01", () => this.setObjective("Pegue o desenho."));
    });

    this.cameras.main.fadeIn(800, 86, 71, 51);
  }

  drawMemoryRoom() {
    const g = this.add.graphics();
    g.fillStyle(0x8e7758, 1);
    g.fillRect(0, 0, W, H);

    // piso e paredes, com visual mais quente e impreciso
    g.fillStyle(0xb29872, 1);
    g.fillRect(35, 35, 890, 470);
    for (let y = 35; y < 505; y += 34) {
      g.lineStyle(1, 0x8f7758, 0.28);
      g.lineBetween(35, y, 925, y);
    }
    g.fillStyle(0x6a5948, 1);
    g.fillRect(20, 20, 920, 22);
    g.fillRect(20, 20, 22, 500);
    g.fillRect(918, 20, 22, 500);
    g.fillRect(20, 498, 920, 22);

    // mesa da lembrança
    g.fillStyle(0x6b513a, 1);
    g.fillRoundedRect(260, 288, 190, 84, 9);
    g.fillStyle(0x57412f, 1);
    g.fillRect(277, 368, 10, 80);
    g.fillRect(425, 368, 10, 80);

    // desenho na mesa
    this.drawingPaper = this.add.rectangle(348, 308, 78, 52, 0xe5d8bc, 1)
      .setStrokeStyle(1, 0x816d50, 0.6);
    this.drawingInk = this.add.text(348, 307, "⌂  ☀", {
      fontFamily: "Georgia, serif", fontSize: "18px", color: "#8d6e4d"
    }).setOrigin(0.5);

    // bancada de Antônio
    g.fillStyle(0x634b38, 1);
    g.fillRoundedRect(635, 150, 150, 66, 7);
    g.fillStyle(0x443529, 1);
    g.fillRect(650, 212, 9, 80);
    g.fillRect(763, 212, 9, 80);
    g.lineStyle(3, 0x4c4338, 0.9);
    g.lineBetween(652, 161, 690, 178);
    g.lineBetween(704, 165, 748, 159);

    // porta / saída para brincar
    g.fillStyle(0x3d332a, 1);
    g.fillRect(900, 340, 35, 115);
    this.add.text(890, 397, "FORA", {
      fontFamily: "system-ui, sans-serif", fontSize: "9px", fontStyle: "bold", color: "#5d4e3b", angle: -90
    }).setOrigin(0.5);

    this.add.rectangle(480, 270, 920, 500, 0x6f563d, 0.08).setDepth(0);
  }

  update() {
    if (!this.player || this.ending) return;

    const v = this.controlsVector();
    this.player.setVelocity(v.x * 132, v.y * 132);

    if (this.dialog.isOpen()) {
      this.hidePrompt();
      return;
    }

    this.nearDrawing = Phaser.Math.Distance.Between(this.player.x, this.player.y, 348, 330) < 82;
    this.nearFather = dist(this.player, this.father) < 82;
    this.nearExit = Phaser.Math.Distance.Between(this.player.x, this.player.y, 880, 400) < 78;

    if (this.phase === 0 && this.nearDrawing) this.showPrompt("E  •  pegar o desenho");
    else if (this.phase === 1 && this.nearFather) this.showPrompt("E  •  mostrar ao pai");
    else if (this.phase === 2 && this.nearDrawing) this.showPrompt("E  •  deixar na mesa");
    else if (this.phase === 3 && this.nearExit) this.showPrompt("E  •  sair para brincar");
    else this.hidePrompt();
  }

  handleAction() {
    if (this.dialog?.isOpen()) return super.handleAction();

    if (this.phase === 0 && this.nearDrawing) {
      this.showDataDialogue("drawingmemory_voce_segura_a_folha_pelas_duas_pont_02", () => {
        this.phase = 1;
        this.setObjective("Mostre o desenho a Antônio.");
      });
      return;
    }

    if (this.phase === 1 && this.nearFather) {
      this.showDataDialogue("drawingmemory_daniel_03", () => {
        this.phase = 2;
        this.setObjective("Deixe o desenho na mesa.");
      });
      return;
    }

    if (this.phase === 2 && this.nearDrawing) {
      this.showDataDialogue("drawingmemory_voce_deixa_o_desenho_sobre_a_mesa_e_04", () => {
        this.phase = 3;
        this.setObjective("Vá brincar.");
      });
      return;
    }

    if (this.phase === 3 && this.nearExit) {
      this.playSilentEnding();
    }
  }

  playSilentEnding() {
    this.ending = true;
    this.hidePrompt();
    this.player.setVelocity(0);
    this.player.setVisible(false);
    this.setObjective("");

    // A lembrança continua sem Daniel. Antônio volta à mesa e guarda a folha.
    this.time.delayedCall(500, () => {
      this.tweens.add({
        targets: this.father,
        x: 470,
        y: 300,
        duration: 1450,
        ease: "Sine.easeInOut",
        onComplete: () => {
          this.time.delayedCall(650, () => {
            this.tweens.add({
              targets: [this.drawingPaper, this.drawingInk],
              alpha: 0,
              duration: 450,
              onComplete: () => {
                this.time.delayedCall(900, () => {
                  SAVE.drawingMemorySeen = true;
                  saveGame();
                  this.cameras.main.fadeOut(1000, 86, 71, 51);
                  this.cameras.main.once("camerafadeoutcomplete", () => {
                    this.returnFromMemory("drawing");
                  });
                });
              }
            });
          });
        }
      });
    });
  }
}