import { W, H, C } from "../config/constants.js";
import BaseScene from "./BaseScene.js";
import GameData from "../systems/GameData.js";
import { SAVE, saveGame, resetSave, markInspected } from "../systems/SaveSystem.js";
import { dist, coreStoryComplete, storyProgress } from "../utils/helpers.js";

export default class GarageScene extends BaseScene {
  constructor() {
    super("GarageScene");
    this.nearest = null;
    this.lampGlow = null;
    this.lampBulb = null;
  }

  create(data = {}) {
    this.physics.world.setBounds(20, 20, W - 40, H - 40);
    this.cameras.main.setBackgroundColor(0x282725);
    this.drawGarage();
    this.bindMovementKeys();

    const objective = SAVE.lampRepaired
      ? "OBJETIVO  •  Continue no seu ritmo."
      : SAVE.workshopMemorySeen
        ? "OBJETIVO  •  Conserte a luminária."
        : "OBJETIVO  •  Explore a oficina.";
    this.createUI(objective);

    this.player = this.physics.add.sprite(848, 386, "daniel");
    this.player.body.setSize(18, 22).setOffset(5, 12);
    this.player.setCollideWorldBounds(true);

    [
      [480, 14, 960, 28],
      [480, 522, 960, 36],
      [16, 270, 32, 540],
      [944, 270, 32, 540],
      [475, 100, 560, 105],      // bancada
      [145, 126, 150, 145],      // armário / painel
      [160, 405, 180, 105],      // caixas / cabos
      [720, 420, 180, 90],       // bancada baixa
      [510, 360, 160, 70],       // mesa de trabalho central
    ].forEach(o => this.physics.add.collider(this.player, this.makeObstacle(...o)));

    this.makeInteractables();
    this.cameras.main.fadeIn(650, 20, 18, 16);

    if (!SAVE.inspected.garage_intro) {
      markInspected("garage_intro");
      this.time.delayedCall(520, () => {
        this.showDataDialogue("garage_a_oficina_ainda_cheira_a_poeira_met_01");
      });
    } else if (data.returnFromWorkshop) {
      this.time.delayedCall(500, () => {
        this.showDataDialogue("garage_voce_ainda_lembra_exatamente_onde_e_02", () => this.setObjective("OBJETIVO  •  Conserte a luminária."));
      });
    }
  }

  drawGarage() {
    const g = this.add.graphics();
    g.fillStyle(0x282725, 1);
    g.fillRect(0, 0, W, H);

    // piso de concreto manchado
    g.fillStyle(0x77736c, 1);
    g.fillRect(30, 30, 900, 480);
    for (let i = 0; i < 34; i++) {
      const x = 55 + ((i * 137) % 840);
      const y = 55 + ((i * 83) % 420);
      g.fillStyle(i % 3 === 0 ? 0x67645e : 0x817d75, 0.20);
      g.fillEllipse(x, y, 34 + (i % 5) * 8, 12 + (i % 4) * 6);
    }

    // paredes
    g.fillStyle(0x44413c, 1);
    g.fillRect(20, 20, 920, 20);
    g.fillRect(20, 20, 20, 500);
    g.fillRect(920, 20, 20, 500);
    g.fillRect(20, 500, 920, 20);

    // passagem de volta para sala
    g.fillStyle(0x211e1b, 1);
    g.fillRect(918, 330, 22, 118);
    g.lineStyle(3, C.woodLight, 0.75);
    g.lineBetween(918, 331, 886, 331);
    g.lineBetween(918, 447, 886, 447);
    this.add.text(900, 389, "SALA", {
      fontFamily: "system-ui, sans-serif",
      fontSize: "9px",
      fontStyle: "bold",
      color: "#a99d8f",
      angle: -90,
    }).setOrigin(0.5);

    // bancada principal
    g.fillStyle(0x4e3f33, 1);
    g.fillRoundedRect(195, 62, 560, 92, 5);
    g.fillStyle(0x716050, 1);
    g.fillRect(195, 62, 560, 18);
    g.fillStyle(0x3c3129, 1);
    g.fillRect(220, 150, 12, 80);
    g.fillRect(718, 150, 12, 80);

    // painel de ferramentas
    g.fillStyle(0x62594e, 1);
    g.fillRect(72, 60, 150, 145);
    for (let y = 78; y < 190; y += 24) {
      g.fillStyle(0x968a79, 0.36);
      for (let x = 88; x < 205; x += 20) g.fillCircle(x, y, 2);
    }
    // ferramentas desenhadas
    g.lineStyle(5, 0x383431, 1);
    g.lineBetween(105, 88, 105, 150);
    g.lineStyle(4, 0xb49b72, 1);
    g.lineBetween(105, 132, 105, 159);
    g.lineStyle(5, 0x4a4641, 1);
    g.lineBetween(145, 96, 165, 145);
    g.lineBetween(165, 96, 145, 145);
    g.fillStyle(0x856a4e, 1);
    g.fillRect(184, 91, 10, 65);
    g.fillStyle(0x45413d, 1);
    g.fillRoundedRect(171, 86, 36, 15, 5);

    // luminária de bancada
    g.lineStyle(7, 0x383735, 1);
    g.lineBetween(492, 115, 526, 88);
    g.lineBetween(526, 88, 560, 112);
    g.fillStyle(0x4b4945, 1);
    g.fillRoundedRect(548, 102, 42, 25, 8);
    g.fillStyle(SAVE.lampRepaired ? 0xf1d99b : 0x5e5951, 1);
    g.fillCircle(560, 115, 7);
    g.fillStyle(0x423d37, 1);
    g.fillRoundedRect(470, 132, 58, 13, 5);

    this.lampGlow = this.add.circle(560, 130, 105, 0xf0c879, SAVE.lampRepaired ? 0.12 : 0)
      .setDepth(0);
    this.lampBulb = this.add.circle(560, 115, 6, 0xf4dc9c, SAVE.lampRepaired ? 0.95 : 0.08)
      .setDepth(2);
    if (SAVE.lampRepaired) {
      this.tweens.add({
        targets: this.lampGlow,
        alpha: { from: 0.09, to: 0.14 },
        yoyo: true,
        repeat: -1,
        duration: 2100,
      });
    }

    // potes de parafusos
    for (let i = 0; i < 5; i++) {
      g.fillStyle(0xa6a094, 0.8);
      g.fillRoundedRect(650 + i * 19, 99, 15, 26, 3);
      g.fillStyle(0x403d39, 0.8);
      g.fillRect(652 + i * 19, 104, 11, 12);
    }

    // mesa de trabalho central
    g.fillStyle(0x564739, 1);
    g.fillRoundedRect(430, 325, 160, 70, 7);
    g.fillStyle(0x796754, 0.5);
    g.fillRect(441, 337, 138, 7);

    // peça desmontada em cima da mesa
    g.fillStyle(0x43413d, 1);
    g.fillCircle(485, 361, 17);
    g.lineStyle(3, 0x2f2d2a, 1);
    g.lineBetween(502, 361, 546, 350);
    g.fillStyle(0x92816a, 1);
    g.fillCircle(548, 350, 5);

    // caixas e cabos
    g.fillStyle(0x80664a, 1);
    g.fillRect(72, 365, 172, 82);
    g.lineStyle(2, 0x55412f, 0.5);
    g.strokeRect(72, 365, 172, 82);
    for (let i = 0; i < 4; i++) {
      g.lineStyle(5, [0x343434, 0x4d4d4d, 0x5c534b, 0x2d3337][i], 1);
      g.strokeCircle(105 + i * 32, 405, 19);
    }

    // bancada baixa e caixas de projeto
    g.fillStyle(0x55483c, 1);
    g.fillRoundedRect(635, 385, 180, 72, 7);
    g.fillStyle(0x8c775d, 1);
    g.fillRect(665, 342, 72, 43);
    g.lineStyle(2, 0x5b4b3b, 0.6);
    g.strokeRect(665, 342, 72, 43);

    // janela alta
    g.fillStyle(0x39444a, 1);
    g.fillRect(770, 62, 105, 70);
    g.lineStyle(3, 0x9a8f80, 0.55);
    g.strokeRect(770, 62, 105, 70);
    g.lineBetween(822, 62, 822, 132);
  }

  makeInteractables() {
    this.interactables = [
      this.objectFromData("sala_from_garage", () => this.roomExit("workshop", "living_room")),
      this.objectFromData("luminaria", () => this.interactLamp(), {
        label: SAVE.lampRepaired ? "luminária consertada" : "luminária quebrada"
      }),
      this.objectFromData("ferramentas"),
      this.objectFromData("cabos"),
      this.objectFromData("parafusos"),
      this.objectFromData("peca"),
      this.objectFromData("projeto"),
      ...this.optionalObjects("workshop"),
    ];

    this.interactables.forEach(item => {
      const sp = this.add.image(item.x, item.y - 30, "spark")
        .setAlpha(0)
        .setDepth(30);
      item.spark = sp;
      this.tweens.add({
        targets: sp,
        y: sp.y - 5,
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

  interactLamp() {
    markInspected("luminaria");

    if (SAVE.lampRepaired) {
      this.showDataDialogue("garage_luminaria_03");
      return;
    }

    if (!SAVE.workshopMemorySeen) {
      this.showDataDialogue("garage_luminaria_04", () => {
        this.showDataChoice("workshop_memory", {
          try: () => this.fadeTo(this.memoryScene("workshop")),
          later: () => {}
        });
      });
      return;
    }

    this.startRepairStage(SAVE.repairStage || 0);
  }

  startRepairStage(stage) {
    const stages = [
      {
        kicker: "REPARO  •  1/3",
        prompt: "A tampa do plugue está presa por um parafuso pequeno.",
        options: [
          ["CHAVE DE FENDA", true],
          ["ALICATE", false],
          ["MARTELO", false],
        ],
        success: "A tampa se solta sem resistência. Você quase ouve Antônio dizendo para não perder o parafuso."
      },
      {
        kicker: "REPARO  •  2/3",
        prompt: "Um dos fios saiu do terminal e precisa ser reposicionado com cuidado.",
        options: [
          ["ALICATE DE BICO", true],
          ["CHAVE INGLESA", false],
          ["MARTELO", false],
        ],
        success: "O fio volta ao lugar. Você o prende sem apertar demais."
      },
      {
        kicker: "REPARO  •  3/3",
        prompt: "O plugue está montado. Falta fechar a tampa.",
        options: [
          ["CHAVE DE FENDA", true],
          ["ALICATE", false],
          ["MARTELO", false],
        ],
        success: "O parafuso encosta no fim da rosca. Só o suficiente."
      }
    ];

    if (stage >= stages.length) {
      this.completeRepair();
      return;
    }

    const data = stages[stage];
    this.dialog.showChoice(data.kicker, data.prompt, data.options.map(([label, correct]) => ({
      label,
      onSelect: () => {
        if (!correct) {
          this.audio?.playSfx("tool_click", { volume: 0.30 }, "ferramenta encosta no metal");
          this.showDataDialogue("garage_ferramenta_errada_05", () => this.startRepairStage(stage));
          return;
        }

        SAVE.repairStage = stage + 1;
        saveGame();
        this.audio?.playSfx("tool_click", { volume: 0.34 }, "clique da ferramenta");
        this.dialog.showPages(data.kicker, [data.success], () => {
          if (stage + 1 >= stages.length) this.completeRepair();
          else this.startRepairStage(stage + 1);
        });
      }
    })));
  }

  completeRepair() {
    if (SAVE.lampRepaired) return;
    SAVE.lampRepaired = true;
    SAVE.repairStage = 3;
    saveGame();

    this.lampGlow.setAlpha(0.12);
    this.lampBulb.setAlpha(0.95);
    this.tweens.add({
      targets: this.lampGlow,
      alpha: { from: 0.08, to: 0.14 },
      yoyo: true,
      repeat: -1,
      duration: 2100,
    });

    const lampItem = this.interactables.find(i => i.id === "luminaria");
    if (lampItem) lampItem.label = "luminária consertada";

    this.showDataDialogue("garage_voce_conecta_a_luminaria_a_tomada_06", () => this.setObjective("OBJETIVO  •  Continue no seu ritmo."));
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

    this.nearest = bestD < this.interactionRadius(78) ? best : null;
    if (this.nearest) this.showPrompt(`E  •  ${this.nearest.label}`);
    else this.hidePrompt();
  }

  handleAction() {
    if (this.dialog?.isOpen()) return super.handleAction();
    if (this.nearest) this.nearest.action();
  }
}