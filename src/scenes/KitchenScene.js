import { W, H, C } from "../config/constants.js";
import BaseScene from "./BaseScene.js";
import GameData from "../systems/GameData.js";
import { SAVE, saveGame, resetSave, markInspected } from "../systems/SaveSystem.js";
import { dist, coreStoryComplete, storyProgress } from "../utils/helpers.js";

export default class KitchenScene extends BaseScene {
  constructor() {
    super("KitchenScene");
    this.nearest = null;
  }

  create(data = {}) {
    this.physics.world.setBounds(20, 20, W - 40, H - 40);
    this.cameras.main.setBackgroundColor(0x332e29);
    this.drawKitchen();
    this.bindMovementKeys();
    this.createUI(SAVE.coffeeMade ? "OBJETIVO  •  Observe o que ficou." : "OBJETIVO  •  Organize a cozinha.");

    const kitchenStartX = data.fromYard ? 838 : 105;
    const kitchenStartY = data.fromYard ? 452 : 295;
    this.player = this.physics.add.sprite(kitchenStartX, kitchenStartY, "daniel");
    this.player.body.setSize(18, 22).setOffset(5, 12);
    this.player.setCollideWorldBounds(true);

    [
      [480, 14, 960, 28],
      [480, 522, 960, 36],
      [16, 270, 32, 540],
      [944, 270, 32, 540],
      [470, 96, 610, 104],       // bancada superior
      [790, 260, 170, 120],      // geladeira/armário
      [493, 342, 220, 118],      // mesa
      [312, 342, 54, 54],        // cadeira
      [674, 342, 54, 54],        // cadeira
    ].forEach(o => this.physics.add.collider(this.player, this.makeObstacle(...o)));

    this.makeInteractables();
    this.cameras.main.fadeIn(650, 20, 18, 16);

    if (!SAVE.inspected.kitchen_intro) {
      markInspected("kitchen_intro");
      this.time.delayedCall(520, () => {
        this.showDataDialogue("kitchen_na_cozinha_a_sensacao_e_diferente_01");
      });
    } else if (data.returnFromDinner) {
      this.time.delayedCall(500, () => {
        this.showDataDialogue("kitchen_ele_perguntava_se_eu_tinha_comido_q_02", () => this.setObjective("OBJETIVO  •  Continue no seu ritmo."));
      });
    } else if (data.returnFromYard && coreStoryComplete()) {
      this.time.delayedCall(500, () => {
        this.showDataDialogue("kitchen_as_caixas_estao_prontas_03", () => this.setObjective("OBJETIVO  •  Volte à sala."));
      });
    }
  }

  drawKitchen() {
    const g = this.add.graphics();

    g.fillStyle(0x332e29, 1);
    g.fillRect(0, 0, W, H);

    // piso de ladrilho antigo
    const tile = 46;
    for (let y = 32; y < 508; y += tile) {
      for (let x = 32; x < 928; x += tile) {
        const even = ((x / tile) + (y / tile)) % 2 < 1;
        g.fillStyle(even ? 0xa99d8c : 0x9b8f80, 1);
        g.fillRect(x, y, tile, tile);
      }
    }

    // paredes
    g.fillStyle(0x4b433b, 1);
    g.fillRect(20, 20, 920, 20);
    g.fillRect(20, 20, 20, 500);
    g.fillRect(920, 20, 20, 500);
    g.fillRect(20, 500, 920, 20);

    // passagem de volta à sala
    g.fillStyle(0x211e1b, 1);
    g.fillRect(20, 235, 22, 118);
    g.lineStyle(3, C.woodLight, 0.75);
    g.lineBetween(42, 236, 76, 236);
    g.lineBetween(42, 352, 76, 352);

    // porta para o quintal
    g.fillStyle(0x211e1b, 1);
    g.fillRect(785, 498, 112, 22);
    g.lineStyle(3, C.woodLight, 0.75);
    g.lineBetween(786, 498, 786, 463);
    g.lineBetween(896, 498, 896, 463);
    this.add.text(841, 479, "QUINTAL", {
      fontFamily: "system-ui, sans-serif", fontSize: "9px", fontStyle: "bold", color: "#a99d8f"
    }).setOrigin(0.5);

    // bancada superior
    g.fillStyle(0x6b5a4c, 1);
    g.fillRoundedRect(165, 52, 610, 88, 7);
    g.fillStyle(0xc0b4a1, 1);
    g.fillRect(165, 52, 610, 16);

    // armários
    for (let x = 180; x <= 700; x += 130) {
      g.fillStyle(0x67594d, 1);
      g.fillRoundedRect(x, 75, 105, 50, 4);
      g.lineStyle(1, 0x3d342d, 0.5);
      g.strokeRoundedRect(x, 75, 105, 50, 4);
      g.fillStyle(0xb49a75, 1);
      g.fillCircle(x + 91, 100, 2.5);
    }

    // pia
    g.fillStyle(0x716d67, 1);
    g.fillRoundedRect(390, 63, 135, 50, 8);
    g.fillStyle(0x41413f, 1);
    g.fillRoundedRect(405, 73, 105, 30, 8);
    g.lineStyle(4, 0x7f7c75, 1);
    g.lineBetween(458, 65, 458, 48);
    g.lineBetween(458, 48, 481, 48);

    // cafeteira e duas canecas
    g.fillStyle(0x34302c, 1);
    g.fillRoundedRect(245, 72, 54, 52, 7);
    g.fillStyle(0x504940, 1);
    g.fillRect(259, 58, 26, 18);

    const mugY = 103;
    g.fillStyle(0xd4c7b4, 1);
    g.fillRoundedRect(315, mugY - 16, 24, 28, 6);
    g.lineStyle(3, 0xd4c7b4, 1);
    g.strokeCircle(341, mugY - 3, 8);

    // Há espaço para uma segunda caneca, mas normalmente só uma permanece ali.
    g.fillStyle(0xb7aa96, 0.16);
    g.fillRoundedRect(352, mugY - 16, 24, 28, 6);

    // geladeira
    g.fillStyle(0xbbb5a9, 1);
    g.fillRoundedRect(735, 168, 130, 205, 8);
    g.lineStyle(2, 0x807a70, 0.55);
    g.lineBetween(735, 250, 865, 250);
    g.fillStyle(0x615b54, 1);
    g.fillRect(750, 205, 4, 36);
    g.fillRect(750, 270, 4, 50);

    // ímãs e bilhete
    g.fillStyle(0x8b5f55, 1);
    g.fillCircle(826, 198, 6);
    g.fillStyle(0x607485, 1);
    g.fillCircle(842, 218, 5);
    g.fillStyle(0xe2d9ca, 1);
    g.fillRect(785, 273, 54, 65);
    g.lineStyle(1, 0x8c8174, 0.5);
    g.lineBetween(793, 287, 831, 287);
    g.lineBetween(793, 299, 825, 299);
    g.lineBetween(793, 311, 829, 311);

    // mesa
    g.fillStyle(C.wood, 1);
    g.fillRoundedRect(380, 285, 226, 118, 10);
    g.fillStyle(C.woodLight, 0.35);
    g.fillRoundedRect(392, 296, 202, 94, 7);

    // prato coberto
    g.fillStyle(0xe0d8cb, 1);
    g.fillCircle(492, 342, 34);
    g.fillStyle(0x8f8171, 1);
    g.fillCircle(492, 342, 23);
    g.fillStyle(0xd7c9b5, 1);
    g.fillRoundedRect(463, 321, 58, 13, 7);
    g.fillCircle(492, 318, 5);

    // cadeiras
    g.fillStyle(0x665548, 1);
    g.fillRoundedRect(282, 314, 60, 58, 7);
    g.fillRoundedRect(646, 314, 60, 58, 7);

    // pote reutilizado / compras
    g.fillStyle(0xafa690, 0.8);
    g.fillRoundedRect(615, 83, 33, 39, 5);
    g.fillStyle(0x71816a, 0.9);
    g.fillRect(619, 78, 25, 7);

    // luz quente sobre mesa
    const glow = this.add.circle(492, 342, 122, 0xd7b77b, 0.055).setDepth(0);
    this.tweens.add({ targets: glow, alpha: { from: 0.035, to: 0.075 }, yoyo: true, repeat: -1, duration: 2400 });
  }

  makeInteractables() {
    this.interactables = [
      this.objectFromData("sala", () => this.roomExit("kitchen", "living_room")),
      this.objectFromData("cafe", () => this.interactCoffee()),
      this.objectFromData("prato", () => this.interactPlate()),
      this.objectFromData("geladeira"),
      this.objectFromData("lista"),
      this.objectFromData("pote"),
      this.objectFromData("pia"),
      this.objectFromData("quintal", () => this.roomExit("kitchen", "backyard")),
      ...this.optionalObjects("kitchen"),
    ];

    this.interactables.forEach(item => {
      const s = this.add.image(item.x, item.y - 30, "spark")
        .setAlpha(0.0)
        .setDepth(30);
      item.spark = s;
      this.tweens.add({
        targets: s,
        y: s.y - 5,
        alpha: { from: 0.18, to: 0.65 },
        yoyo: true,
        repeat: -1,
        duration: 950 + Phaser.Math.Between(0, 250),
        ease: "Sine.easeInOut",
      });
    });
  }

  inspect(title, pages, id) {
    markInspected(id);
    this.dialog.showPages(title, pages);
  }

  interactCoffee() {
    markInspected("cafe");

    if (SAVE.coffeeMade) {
      this.showDataDialogue("kitchen_cafe_04");
      return;
    }

    this.showDataChoice("kitchen_cafeteira_01", { option_1: () => this.makeCoffee(), option_2: () => {} });
  }

  makeCoffee() {
    SAVE.coffeeMade = true;
    saveGame();
    this.audio?.playSfx("object_put", { volume: 0.25 }, "canecas sobre a bancada");

    // A segunda caneca aparece apenas durante a ação; depois é guardada.
    const tempMug = this.add.graphics().setDepth(8);
    tempMug.fillStyle(0xd4c7b4, 1);
    tempMug.fillRoundedRect(352, 87, 24, 28, 6);
    tempMug.lineStyle(3, 0xd4c7b4, 1);
    tempMug.strokeCircle(378, 100, 8);

    this.showDataDialogue("kitchen_voce_mede_o_po_sem_pensar_o_corpo_l_05", () => {
      this.tweens.add({
        targets: tempMug,
        alpha: 0,
        duration: 550,
        onComplete: () => tempMug.destroy()
      });
      this.setObjective("OBJETIVO  •  Observe o que ficou.");
    });
  }

  interactPlate() {
    markInspected("prato");

    if (SAVE.dinnerMemorySeen) {
      this.showDataDialogue("kitchen_prato_06");
      return;
    }

    this.showDataDialogue("kitchen_prato_07", () => {
      this.showDataChoice("dinner_memory", {
        remember: () => this.fadeTo(this.memoryScene("dinner")),
        later: () => {}
      });
    });
  }

  update() {
    if (!this.player) return;

    const v = this.controlsVector();
    this.player.setVelocity(v.x * 150, v.y * 150);

    if (this.dialog.isOpen()) {
      this.hidePrompt();
      return;
    }

    let best = null;
    let bestD = 99999;
    for (const item of this.interactables) {
      const d = dist(this.player, item);
      if (d < bestD) {
        best = item;
        bestD = d;
      }
      item.spark.setAlpha(d < 120 ? 0.65 : 0.12);
    }

    this.nearest = bestD < this.interactionRadius(76) ? best : null;
    if (this.nearest) this.showPrompt(`E  •  ${this.nearest.label}`);
    else this.hidePrompt();
  }

  handleAction() {
    if (this.dialog?.isOpen()) return super.handleAction();
    if (this.nearest) this.nearest.action();
  }
}