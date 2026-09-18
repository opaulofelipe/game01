import { W, H, C } from "../config/constants.js";
import BaseScene from "./BaseScene.js";
import GameData from "../systems/GameData.js";
import { SAVE, saveGame, resetSave, markInspected } from "../systems/SaveSystem.js";
import { dist, coreStoryComplete, storyProgress } from "../utils/helpers.js";

export default class DanielRoomScene extends BaseScene {
  constructor() {
    super("DanielRoomScene");
    this.nearest = null;
  }

  create(data = {}) {
    this.physics.world.setBounds(20, 20, W - 40, H - 40);
    this.cameras.main.setBackgroundColor(0x34312d);
    this.drawDanielRoom();
    this.bindMovementKeys();
    this.createUI(SAVE.keepsakeBoxOpened
      ? "OBJETIVO  •  Continue no seu ritmo."
      : "OBJETIVO  •  Explore seu antigo quarto.");

    this.player = this.physics.add.sprite(480, 454, "daniel");
    this.player.body.setSize(18, 22).setOffset(5, 12);
    this.player.setCollideWorldBounds(true);

    [
      [480, 14, 960, 28],
      [480, 522, 960, 36],
      [16, 270, 32, 540],
      [944, 270, 32, 540],
      [190, 165, 255, 145],      // cama
      [190, 390, 220, 86],       // escrivaninha
      [785, 160, 185, 210],      // guarda-roupa
      [558, 117, 160, 72],       // estante
      [745, 400, 130, 84],       // caixas / caixa Daniel
    ].forEach(o => this.physics.add.collider(this.player, this.makeObstacle(...o)));

    this.makeInteractables();
    this.cameras.main.fadeIn(650, 20, 18, 16);

    if (data.fromRoom && !SAVE.keepsakeBoxOpened) {
      this.time.delayedCall(520, () => {
        this.showDataDialogue("danielroom_seu_quarto_embora_ja_nao_seja_exata_01");
      });
    } else if (data.returnFromDrawing) {
      this.time.delayedCall(520, () => {
        this.showDataDialogue("danielroom_voce_continua_segurando_o_desenho_02", () => this.setObjective("OBJETIVO  •  Continue no seu ritmo."));
      });
    }
  }

  drawDanielRoom() {
    const g = this.add.graphics();
    g.fillStyle(0x34312d, 1);
    g.fillRect(0, 0, W, H);

    // piso mais claro que o quarto de Antônio
    g.fillStyle(0x887963, 1);
    g.fillRect(30, 30, 900, 480);
    for (let y = 30; y < 510; y += 30) {
      g.lineStyle(1, 0x756955, 0.40);
      g.lineBetween(30, y, 930, y);
      const offset = ((y / 30) % 2) * 72;
      for (let x = 30 + offset; x < 930; x += 145) g.lineBetween(x, y, x, y + 30);
    }

    // paredes e saída
    g.fillStyle(0x514a42, 1);
    g.fillRect(20, 20, 920, 20);
    g.fillRect(20, 20, 20, 500);
    g.fillRect(920, 20, 20, 500);
    g.fillRect(20, 500, 390, 20);
    g.fillRect(550, 500, 390, 20);
    g.fillStyle(0x211e1b, 1);
    g.fillRect(410, 500, 140, 20);
    g.lineStyle(3, C.woodLight, 0.75);
    g.lineBetween(412, 500, 412, 464);
    g.lineBetween(548, 500, 548, 464);
    this.add.text(480, 482, "SALA", {
      fontFamily: "system-ui, sans-serif", fontSize: "9px", fontStyle: "bold", color: "#a99d8f"
    }).setOrigin(0.5);

    // janela
    g.fillStyle(0x3d4b53, 1);
    g.fillRect(405, 40, 150, 58);
    g.lineStyle(3, 0xc5b9a9, 0.48);
    g.strokeRect(405, 40, 150, 58);
    g.lineBetween(480, 40, 480, 98);

    // cama antiga
    g.fillStyle(0x4f4238, 1);
    g.fillRoundedRect(68, 96, 260, 145, 12);
    g.fillStyle(0xb9ae9e, 1);
    g.fillRoundedRect(80, 107, 236, 122, 10);
    g.fillStyle(0x778088, 1);
    g.fillRoundedRect(80, 164, 236, 65, 8);
    g.fillStyle(0xd8d0c4, 1);
    g.fillRoundedRect(91, 115, 88, 40, 9);

    // pôster dobrado/desbotado na parede
    g.fillStyle(0x6d665f, 1);
    g.fillRect(82, 48, 105, 36);
    g.lineStyle(2, 0xa99c89, 0.35);
    g.strokeRect(82, 48, 105, 36);
    g.lineBetween(135, 48, 135, 84);

    // escrivaninha
    g.fillStyle(0x5a493b, 1);
    g.fillRoundedRect(80, 350, 220, 80, 8);
    g.fillStyle(0x42362d, 1);
    g.fillRect(92, 427, 11, 55);
    g.fillRect(278, 427, 11, 55);

    // videogame antigo
    g.fillStyle(0x353535, 1);
    g.fillRoundedRect(115, 323, 72, 29, 7);
    g.fillStyle(0x8d8376, 1);
    g.fillCircle(133, 337, 4);
    g.fillCircle(160, 337, 3);
    g.lineStyle(2, 0x37332f, 1);
    g.lineBetween(187, 337, 209, 324);
    g.strokeCircle(219, 319, 9);

    // cadernos / livros escolares
    for (let i = 0; i < 4; i++) {
      g.fillStyle([0x6c7881, 0x7f675b, 0x70785f, 0x766b7d][i], 1);
      g.fillRect(220 + i * 14, 320 - i * 2, 10, 35 + i * 2);
    }

    // estante que virou depósito
    g.fillStyle(0x5d4c3e, 1);
    g.fillRoundedRect(478, 85, 160, 72, 7);
    g.fillStyle(0x44372e, 1);
    g.fillRect(486, 118, 144, 5);
    g.fillStyle(0x81725e, 1);
    g.fillRect(496, 94, 46, 24);
    g.fillStyle(0x6a6258, 1);
    g.fillRect(550, 90, 62, 28);

    // mochila antiga
    g.fillStyle(0x59666d, 1);
    g.fillRoundedRect(493, 176, 62, 78, 13);
    g.lineStyle(3, 0x41494d, 1);
    g.strokeRoundedRect(504, 189, 40, 38, 8);
    g.lineBetween(505, 176, 498, 159);
    g.lineBetween(544, 176, 551, 159);

    // guarda-roupa
    g.fillStyle(0x5a493a, 1);
    g.fillRoundedRect(690, 58, 190, 214, 8);
    g.lineStyle(2, 0x3d322a, 0.55);
    g.lineBetween(785, 64, 785, 266);
    g.fillStyle(0xb19a72, 0.8);
    g.fillCircle(775, 168, 4);
    g.fillCircle(795, 168, 4);

    // caixas comuns de depósito
    g.fillStyle(0x806849, 1);
    g.fillRect(650, 358, 90, 67);
    g.fillRect(785, 366, 82, 61);
    g.lineStyle(1, 0x5b4933, 0.6);
    g.strokeRect(650, 358, 90, 67);
    g.strokeRect(785, 366, 82, 61);

    // caixa principal: DANIEL
    g.fillStyle(0x957752, 1);
    g.fillRect(695, 326, 118, 84);
    g.lineStyle(2, 0x604b35, 0.62);
    g.strokeRect(695, 326, 118, 84);
    g.lineBetween(754, 326, 754, 410);
    g.fillStyle(0xd8c8ab, 1);
    g.fillRect(716, 353, 76, 24);
    this.add.text(754, 365, "DANIEL", {
      fontFamily: "system-ui, sans-serif", fontSize: "10px", fontStyle: "bold", color: "#584531"
    }).setOrigin(0.5);

    // pequenas marcas onde coisas já foram retiradas da parede
    g.lineStyle(1, 0x372f29, 0.45);
    g.strokeRect(248, 56, 86, 42);
    g.strokeRect(612, 48, 60, 33);
  }

  makeInteractables() {
    this.interactables = [
      this.objectFromData("sala_from_daniel", () => this.roomExit("daniel_bedroom", "living_room")),
      this.objectFromData("poster_daniel"),
      this.objectFromData("videogame_daniel"),
      this.objectFromData("cadernos_daniel"),
      this.objectFromData("mochila_daniel"),
      this.objectFromData("guarda_daniel"),
      this.objectFromData("caixa_daniel", () => this.interactKeepsakeBox()),
      ...this.optionalObjects("daniel_bedroom"),
    ];

    this.interactables.forEach(item => {
      const sp = this.add.image(item.x, item.y - 30, "spark").setAlpha(0).setDepth(30);
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

  interactKeepsakeBox() {
    markInspected("caixa_daniel");

    if (!SAVE.keepsakeBoxOpened) {
      SAVE.keepsakeBoxOpened = true;
      saveGame();
      this.showDataDialogue("danielroom_daniel_03", () => this.offerDrawing());
      return;
    }

    this.showDataChoice("keepsake_box_repeat", {
      drawing: () => this.offerDrawing(),
      others: () => this.showDataDialogue("keepsake_box_other_items"),
      close: () => {}
    });
  }

  offerDrawing() {
    if (SAVE.drawingMemorySeen) {
      this.showDataDialogue("danielroom_desenho_04");
      return;
    }

    this.showDataDialogue("danielroom_desenho_05", () => {
      this.showDataChoice("drawing_memory", {
        remember: () => this.fadeTo(this.memoryScene("drawing")),
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