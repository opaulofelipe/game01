import { W, H, C } from "../config/constants.js";
import BaseScene from "./BaseScene.js";
import GameData from "../systems/GameData.js";
import { SAVE, saveGame, resetSave, markInspected } from "../systems/SaveSystem.js";
import { dist, coreStoryComplete, storyProgress } from "../utils/helpers.js";

export default class BedroomScene extends BaseScene {
  constructor() {
    super("BedroomScene");
    this.nearest = null;
  }

  create(data = {}) {
    this.physics.world.setBounds(20, 20, W - 40, H - 40);
    this.cameras.main.setBackgroundColor(0x2f2a26);
    this.drawBedroom();
    this.bindMovementKeys();
    this.createUI(SAVE.argumentMemorySeen
      ? "OBJETIVO  •  Continue no seu ritmo."
      : "OBJETIVO  •  Explore o quarto de Antônio.");

    this.player = this.physics.add.sprite(480, 454, "daniel");
    this.player.body.setSize(18, 22).setOffset(5, 12);
    this.player.setCollideWorldBounds(true);

    [
      [480, 14, 960, 28],
      [480, 522, 960, 36],
      [16, 270, 32, 540],
      [944, 270, 32, 540],
      [215, 170, 260, 155],      // cama
      [780, 150, 180, 115],      // guarda-roupa
      [710, 384, 240, 92],       // cômoda
      [150, 394, 155, 92],       // escrivaninha
      [425, 105, 92, 68],        // criado-mudo
    ].forEach(o => this.physics.add.collider(this.player, this.makeObstacle(...o)));

    this.makeInteractables();
    this.cameras.main.fadeIn(650, 20, 18, 16);

    if (!SAVE.inspected.bedroom_intro) {
      markInspected("bedroom_intro");
      this.time.delayedCall(520, () => {
        this.showDataDialogue("bedroom_voce_quase_nunca_entrava_aqui_sem_b_01");
      });
    } else if (data.returnFromArgument) {
      this.time.delayedCall(520, () => {
        this.showDataDialogue("bedroom_a_lembranca_termina_no_mesmo_lugar__02", () => this.setObjective("OBJETIVO  •  Continue no seu ritmo."));
      });
    }
  }

  drawBedroom() {
    const g = this.add.graphics();
    g.fillStyle(0x2f2a26, 1);
    g.fillRect(0, 0, W, H);

    // piso de madeira escura
    g.fillStyle(0x776754, 1);
    g.fillRect(30, 30, 900, 480);
    for (let y = 30; y < 510; y += 30) {
      g.lineStyle(1, 0x665847, 0.42);
      g.lineBetween(30, y, 930, y);
      const offset = ((y / 30) % 2) * 68;
      for (let x = 30 + offset; x < 930; x += 138) g.lineBetween(x, y, x, y + 30);
    }

    // paredes
    g.fillStyle(0x49413a, 1);
    g.fillRect(20, 20, 920, 20);
    g.fillRect(20, 20, 20, 500);
    g.fillRect(920, 20, 20, 500);
    g.fillRect(20, 500, 390, 20);
    g.fillRect(550, 500, 390, 20);

    // saída
    g.fillStyle(0x211e1b, 1);
    g.fillRect(410, 500, 140, 20);
    g.lineStyle(3, C.woodLight, 0.75);
    g.lineBetween(412, 500, 412, 464);
    g.lineBetween(548, 500, 548, 464);
    this.add.text(480, 482, "SALA", {
      fontFamily: "system-ui, sans-serif",
      fontSize: "9px",
      fontStyle: "bold",
      color: "#a99d8f",
    }).setOrigin(0.5);

    // janela
    g.fillStyle(0x34434b, 1);
    g.fillRect(395, 40, 170, 62);
    g.lineStyle(3, 0xb7aa98, 0.5);
    g.strokeRect(395, 40, 170, 62);
    g.lineBetween(480, 40, 480, 102);

    // cama
    g.fillStyle(0x4e4136, 1);
    g.fillRoundedRect(82, 102, 265, 156, 12);
    g.fillStyle(0xafa28e, 1);
    g.fillRoundedRect(94, 113, 242, 131, 10);
    g.fillStyle(0xd1c7b8, 1);
    g.fillRoundedRect(104, 120, 86, 44, 10);
    g.fillStyle(0x6b7774, 0.82);
    g.fillRoundedRect(94, 177, 242, 67, 8);

    // criado-mudo
    g.fillStyle(C.wood, 1);
    g.fillRoundedRect(380, 105, 90, 66, 7);
    g.fillStyle(0x3d3128, 1);
    g.fillRect(389, 132, 72, 5);
    g.fillCircle(425, 147, 3);

    // relógio
    g.fillStyle(0x373331, 1);
    g.fillRoundedRect(402, 83, 44, 26, 6);
    g.fillStyle(0xb9a98e, 1);
    g.fillRect(410, 91, 28, 7);

    // guarda-roupa
    g.fillStyle(0x564638, 1);
    g.fillRoundedRect(690, 72, 180, 190, 8);
    g.lineStyle(2, 0x392f28, 0.55);
    g.lineBetween(780, 78, 780, 255);
    g.fillStyle(0xb19a72, 0.8);
    g.fillCircle(770, 165, 4);
    g.fillCircle(790, 165, 4);

    // cômoda
    g.fillStyle(0x5e4b3c, 1);
    g.fillRoundedRect(600, 345, 245, 88, 8);
    for (let y of [365, 392, 418]) {
      g.lineStyle(2, 0x3d3129, 0.6);
      g.lineBetween(612, y, 833, y);
    }
    for (let y of [355, 380, 407]) {
      g.fillStyle(0xb19a72, 0.8);
      g.fillCircle(722, y + 10, 3);
    }

    // foto de Antônio jovem
    g.fillStyle(0x8d7658, 1);
    g.fillRect(635, 299, 52, 61);
    g.fillStyle(0xc9bcaa, 1);
    g.fillRect(641, 305, 40, 48);
    g.fillStyle(0x726557, 1);
    g.fillCircle(661, 318, 7);
    g.fillRect(653, 327, 16, 15);

    // papéis / contas
    g.fillStyle(0xdbd3c7, 1);
    g.fillRect(752, 320, 58, 35);
    g.fillStyle(0xc9c0b3, 1);
    g.fillRect(762, 315, 55, 34);
    g.lineStyle(1, 0x82796f, 0.55);
    g.lineBetween(769, 325, 804, 325);
    g.lineBetween(769, 332, 801, 332);

    // escrivaninha
    g.fillStyle(0x58483a, 1);
    g.fillRoundedRect(76, 356, 175, 77, 7);
    g.fillStyle(0x40342b, 1);
    g.fillRect(88, 428, 10, 52);
    g.fillRect(230, 428, 10, 52);

    // lista dobrada
    g.fillStyle(0xdfd7c8, 1);
    g.fillRect(113, 335, 68, 48);
    g.lineStyle(1, 0x8d8376, 0.45);
    for (let y = 345; y < 375; y += 8) g.lineBetween(120, y, 170, y);

    // carta antiga
    g.fillStyle(0xcdbfaa, 1);
    g.fillRect(196, 337, 42, 31);
    g.lineStyle(1, 0x766b5e, 0.5);
    g.lineBetween(196, 337, 217, 352);
    g.lineBetween(238, 337, 217, 352);

    // chinelos / sinais cotidianos
    g.fillStyle(0x3f4141, 1);
    g.fillEllipse(510, 410, 17, 36);
    g.fillEllipse(535, 415, 17, 36);

    // leve sombra no quarto
    this.add.rectangle(480, 270, 920, 500, 0x1d1916, 0.08).setDepth(0);
  }

  makeInteractables() {
    this.interactables = [
      this.objectFromData("sala_from_bedroom", () => this.roomExit("antonio_bedroom", "living_room")),
      this.objectFromData("foto_pai_jovem"),
      this.objectFromData("lista_quarto"),
      this.objectFromData("contas_quarto"),
      this.objectFromData("carta_antiga"),
      this.objectFromData("relogio"),
      this.objectFromData("guarda_roupa"),
      this.objectFromData("gaveta", () => this.interactDrawer()),
      ...this.optionalObjects("antonio_bedroom"),
    ];

    this.interactables.forEach(item => {
      const sp = this.add.image(item.x, item.y - 30, "spark")
        .setAlpha(0).setDepth(30);
      item.spark = sp;
      this.tweens.add({
        targets: sp,
        y: sp.y - 5,
        alpha: { from: 0.18, to: 0.65 },
        yoyo: true,
        repeat: -1,
        duration: 900 + Phaser.Math.Between(0, 280),
        ease: "Sine.easeInOut",
      });
    });
  }

  inspect(title, pages, id) {
    markInspected(id);
    this.dialog.showPages(title, pages);
  }

  interactDrawer() {
    markInspected("gaveta_quarto");

    if (SAVE.argumentMemorySeen) {
      this.showDataDialogue("bedroom_gaveta_03");
      return;
    }

    this.showDataDialogue("bedroom_gaveta_04", () => {
      this.showDataChoice("argument_memory", {
        remember: () => this.fadeTo(this.memoryScene("argument")),
        later: () => {}
      });
    });
  }

  update() {
    if (!this.player) return;
    const v = this.controlsVector();
    this.player.setVelocity(v.x * 148, v.y * 148);

    if (this.dialog.isOpen()) {
      this.hidePrompt();
      return;
    }

    let best = null;
    let bestD = 99999;
    for (const item of this.interactables) {
      const d = dist(this.player, item);
      if (d < bestD) { best = item; bestD = d; }
      item.spark.setAlpha(d < 120 ? 0.65 : 0.12);
    }

    this.nearest = bestD < this.interactionRadius(78) ? best : null;
    if (this.nearest) this.showPrompt(`E  •  ${this.nearest.label}`);
    else this.hidePrompt();
  }

  handleAction() {
    if (this.dialog?.isOpen()) return super.handleAction();
    if (this.nearest) this.nearest.action();
  }
}