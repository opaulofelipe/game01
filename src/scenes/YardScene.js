import { W, H, C } from "../config/constants.js";
import BaseScene from "./BaseScene.js";
import GameData from "../systems/GameData.js";
import { SAVE, saveGame, resetSave, markInspected } from "../systems/SaveSystem.js";
import { dist, coreStoryComplete, storyProgress } from "../utils/helpers.js";

export default class YardScene extends BaseScene {
  constructor() {
    super("YardScene");
    this.nearest = null;
    this.waterFx = null;
  }

  create(data = {}) {
    this.physics.world.setBounds(20, 20, W - 40, H - 40);
    this.cameras.main.setBackgroundColor(0x283129);
    this.drawYard();
    this.bindMovementKeys();
    this.createUI(SAVE.treeWatered ? "OBJETIVO  •  Fique mais um pouco." : "OBJETIVO  •  Cuide do que ainda está vivo.");

    this.player = this.physics.add.sprite(480, 90, "daniel");
    this.player.body.setSize(18, 22).setOffset(5, 12);
    this.player.setCollideWorldBounds(true);

    [
      [480, 14, 960, 28], [480, 522, 960, 36], [16, 270, 32, 540], [944, 270, 32, 540],
      [725, 310, 165, 72], [215, 390, 160, 54], [480, 314, 150, 150]
    ].forEach(o => this.physics.add.collider(this.player, this.makeObstacle(...o)));

    this.makeInteractables();
    this.cameras.main.fadeIn(700, 31, 42, 34);

    if (!SAVE.inspected.yard_intro) {
      markInspected("yard_intro");
      this.time.delayedCall(500, () => {
        this.showDataDialogue("yard_o_quintal_parece_maior_sem_ninguem__01");
      });
    } else if (data.returnFromReinterpretation) {
      this.time.delayedCall(500, () => {
        this.showDataDialogue("yard_na_epoca_voce_leu_aquela_mensagem_c_02", () => {
          if (coreStoryComplete()) this.setObjective("OBJETIVO  •  Volte para dentro.");
        });
      });
    }
  }

  drawYard() {
    const g = this.add.graphics();
    g.fillStyle(0x303b31, 1);
    g.fillRect(0, 0, W, H);

    // grama irregular
    for (let y = 30; y < 510; y += 28) {
      for (let x = 30; x < 930; x += 32) {
        const shade = ((x + y) / 30) % 2 > 1 ? 0x38463a : 0x344035;
        g.fillStyle(shade, 0.9);
        g.fillRect(x, y, 32, 28);
      }
    }

    // parede dos fundos da casa e porta da cozinha
    g.fillStyle(0x5d554c, 1);
    g.fillRect(30, 30, 900, 72);
    g.fillStyle(0x332d28, 1);
    g.fillRect(425, 30, 110, 74);
    g.fillStyle(0x90775b, 1);
    g.fillCircle(520, 67, 4);
    this.add.text(480, 116, "COZINHA", {
      fontFamily: "system-ui, sans-serif", fontSize: "9px", fontStyle: "bold", color: "#9d9488"
    }).setOrigin(0.5);

    // árvore antiga
    g.fillStyle(0x5a4937, 1);
    g.fillRoundedRect(452, 235, 56, 175, 18);
    g.lineStyle(14, 0x5a4937, 1);
    g.lineBetween(475, 275, 410, 210);
    g.lineBetween(492, 282, 555, 212);
    const leaves = [[420,190,58],[470,175,70],[525,192,63],[455,225,64],[515,230,60],[390,225,47],[555,235,48]];
    for (const [x,y,r] of leaves) {
      g.fillStyle(0x53654f, 1);
      g.fillCircle(x,y,r);
      g.fillStyle(0x64745b, 0.42);
      g.fillCircle(x-10,y-8,r*0.72);
    }

    // círculo de terra
    g.fillStyle(0x6f5b43, 1);
    g.fillEllipse(480, 415, 190, 65);
    if (SAVE.treeWatered) {
      g.fillStyle(0x4f4437, 0.7);
      g.fillEllipse(480, 415, 150, 46);
    }

    // regador
    g.fillStyle(0x657a78, 1);
    g.fillRoundedRect(350, 405, 50, 38, 8);
    g.lineStyle(6, 0x657a78, 1);
    g.strokeCircle(358, 410, 24);
    g.lineBetween(396, 414, 430, 399);

    // banco
    g.fillStyle(0x66523e, 1);
    g.fillRoundedRect(645, 288, 165, 45, 7);
    g.fillRect(660, 330, 9, 50);
    g.fillRect(785, 330, 9, 50);

    // celular de Daniel sobre o banco
    g.fillStyle(0x242424, 1);
    g.fillRoundedRect(717, 275, 26, 42, 5);
    g.fillStyle(0x738088, 0.55);
    g.fillRoundedRect(720, 279, 20, 31, 3);

    // varal e sinais cotidianos
    g.lineStyle(3, 0xb4aa95, 0.5);
    g.lineBetween(90, 185, 285, 165);
    for (const [x,y] of [[125,181],[175,176],[235,170]]) {
      g.fillStyle(0x77756d, 0.8);
      g.fillRect(x, y, 38, 28);
    }

    // pequena cadeira antiga
    g.fillStyle(0x5f5143, 1);
    g.fillRoundedRect(150, 368, 130, 45, 7);
    g.fillRect(165, 410, 8, 50);
    g.fillRect(255, 410, 8, 50);

    // entardecer discreto
    this.add.rectangle(480,270,920,500,0x22302d,0.10).setDepth(0);
  }

  makeInteractables() {
    this.interactables = [
      this.objectFromData("cozinha_from_yard", () => this.roomExit("backyard", "kitchen")),
      this.objectFromData("arvore", () => this.interactTree(), {
        label: SAVE.treeWatered ? "árvore" : "regar a árvore"
      }),
      this.objectFromData("celular_quintal", () => this.interactPhone()),
      this.objectFromData("banco_quintal"),
      this.objectFromData("varal"),
      this.objectFromData("cadeira_quintal"),
      ...this.optionalObjects("backyard"),
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
        duration: 950 + Phaser.Math.Between(0,250),
        ease: "Sine.easeInOut"
      });
    });
  }

  inspect(title, pages, id) {
    markInspected(id);
    this.dialog.showPages(title, pages);
  }

  interactTree() {
    markInspected("arvore_quintal");
    if (SAVE.treeWatered) {
      this.showDataDialogue("yard_arvore_03");
      return;
    }

    this.showDataChoice("tree_water", {
      water: () => {
        SAVE.treeWatered = true;
        saveGame();
        this.playWaterEffect();
      },
      leave: () => {}
    });
  }

  playWaterEffect() {
    this.audio?.playSfx("faucet", { volume: 0.28 }, "água correndo");
    const drops = [];
    for (let i = 0; i < 18; i++) {
      const drop = this.add.circle(398 + Phaser.Math.Between(-8,22), 385 + Phaser.Math.Between(-12,10), 3, 0x8aa6af, 0.8).setDepth(20);
      drops.push(drop);
      this.tweens.add({
        targets: drop,
        x: 445 + Phaser.Math.Between(-25,35),
        y: 420 + Phaser.Math.Between(-8,18),
        alpha: 0,
        duration: 550 + Phaser.Math.Between(0,300),
        onComplete: () => drop.destroy()
      });
    }
    this.time.delayedCall(700, () => {
      this.showDataDialogue("yard_a_agua_desaparece_rapido_na_terra_04", () => {
        if (SAVE.argumentMemorySeen && SAVE.drawingMemorySeen && !SAVE.reinterpretationSeen) {
          this.setObjective("OBJETIVO  •  Olhe o celular no banco.");
        }
      });
    });
  }

  interactPhone() {
    markInspected("celular_quintal");
    if (SAVE.reinterpretationSeen) {
      this.showDataDialogue("yard_celular_05");
      return;
    }

    if (!(SAVE.treeWatered && SAVE.argumentMemorySeen && SAVE.drawingMemorySeen)) {
      this.showDataDialogue("yard_celular_06");
      return;
    }

    this.showDataDialogue("yard_celular_07", () => {
      this.showDataChoice("reinterpretation_memory", {
        read: () => this.fadeTo(this.memoryScene("reinterpretation")),
        later: () => {}
      });
    });
  }

  update() {
    if (!this.player) return;
    const v = this.controlsVector();
    this.player.setVelocity(v.x * 148, v.y * 148);

    if (this.dialog.isOpen()) { this.hidePrompt(); return; }

    let best = null; let bestD = 99999;
    for (const item of this.interactables) {
      const d = dist(this.player, item);
      if (d < bestD) { best = item; bestD = d; }
      item.spark.setAlpha(d < 120 ? 0.65 : 0.12);
    }
    this.nearest = bestD < this.interactionRadius(80) ? best : null;
    if (this.nearest) this.showPrompt(`E  •  ${this.nearest.label}`); else this.hidePrompt();
  }

  handleAction() {
    if (this.dialog?.isOpen()) return super.handleAction();
    if (this.nearest) this.nearest.action();
  }
}