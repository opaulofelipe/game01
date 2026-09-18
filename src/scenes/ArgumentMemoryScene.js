import { W, H, C } from "../config/constants.js";
import BaseScene from "./BaseScene.js";
import GameData from "../systems/GameData.js";
import { SAVE, saveGame, resetSave, markInspected } from "../systems/SaveSystem.js";
import { dist, coreStoryComplete, storyProgress } from "../utils/helpers.js";

export default class ArgumentMemoryScene extends BaseScene {
  constructor() {
    super("ArgumentMemoryScene");
    this.phase = 0;
    this.nearFather = false;
    this.nearDoor = false;
  }

  create() {
    this.physics.world.setBounds(0, 0, W, H);
    this.drawArgumentRoom();
    this.bindMovementKeys();
    this.createUI("SEIS MESES ANTES");

    this.player = this.physics.add.sprite(255, 390, "daniel");
    this.player.body.setSize(18, 22).setOffset(5, 12);
    this.player.setCollideWorldBounds(true);

    this.father = this.physics.add.sprite(600, 290, "antonio");
    this.father.setImmovable(true);
    this.physics.add.collider(this.player, this.father);

    [
      [480, 22, 960, 44], [480, 520, 960, 40], [24, 270, 48, 540], [936, 270, 48, 540],
      [475, 305, 220, 80], [470, 390, 120, 52], [790, 160, 145, 60]
    ].forEach(o => this.physics.add.collider(this.player, this.makeObstacle(...o)));

    this.time.delayedCall(560, () => {
      this.showDataDialogue("argumentmemory_voce_veio_contar_uma_coisa_que_ja_e_01", () => this.setObjective("Fale com Antônio."));
    });

    this.cameras.main.fadeIn(760, 85, 69, 51);
  }

  drawArgumentRoom() {
    const g = this.add.graphics();
    g.fillStyle(0x4b4035, 1);
    g.fillRect(0, 0, W, H);
    g.fillStyle(0x927e66, 1);
    g.fillRect(30, 30, 900, 480);

    for (let y = 30; y < 510; y += 30) {
      g.lineStyle(1, 0x796852, 0.32);
      g.lineBetween(30, y, 930, y);
    }

    g.fillStyle(0x40372f, 1);
    g.fillRect(20, 20, 920, 20); g.fillRect(20, 20, 20, 500); g.fillRect(920, 20, 20, 500);
    g.fillRect(20, 500, 780, 20); g.fillRect(875, 500, 65, 20);

    // sofá e mesa semelhantes à sala, mas lembrança mais quente
    g.fillStyle(0x626861, 1);
    g.fillRoundedRect(365, 265, 220, 78, 14);
    g.fillStyle(0x554536, 1);
    g.fillRoundedRect(410, 365, 120, 48, 7);

    // aparador
    g.fillStyle(0x65523f, 1);
    g.fillRoundedRect(720, 130, 145, 55, 6);
    g.fillStyle(0x32302d, 1);
    g.fillRoundedRect(765, 110, 55, 30, 5);

    // porta de saída
    g.fillStyle(0x211e1b, 1);
    g.fillRect(800, 480, 75, 40);
    g.lineStyle(3, 0x917657, 0.75);
    g.lineBetween(800, 480, 800, 430);
    g.lineBetween(875, 480, 875, 430);

    this.add.circle(600, 290, 170, 0xe0b66e, 0.045).setDepth(0);
    this.add.text(80, 112, "Algumas conversas mudam de peso depois que acabam.", {
      fontFamily: "Georgia, serif",
      fontSize: "17px",
      fontStyle: "italic",
      color: "#c8baa5",
      wordWrap: { width: 275 }
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

    this.nearFather = dist(this.player, this.father) < 84;
    this.nearDoor = Phaser.Math.Distance.Between(this.player.x, this.player.y, 835, 450) < 90;

    if (this.phase === 0 && this.nearFather) this.showPrompt("E  •  conversar");
    else if (this.phase === 1 && this.nearDoor) this.showPrompt("E  •  ir embora");
    else this.hidePrompt();
  }

  handleAction() {
    if (this.dialog?.isOpen()) return super.handleAction();

    if (this.phase === 0 && this.nearFather) {
      this.startArgument();
      return;
    }

    if (this.phase === 1 && this.nearDoor) {
      this.finishArgument();
    }
  }

  startArgument() {
    this.phase = 99;
    this.player.setVelocity(0);
    this.showDataDialogue("argumentmemory_daniel_02", () => {
      this.showDataChoice("argument_first_response", {
        hurt: () => this.argumentMiddle("ferido"),
        direct: () => this.argumentMiddle("direto"),
        closed: () => this.argumentMiddle("fechado")
      });
    });
  }

  argumentMiddle(tone) {
    SAVE.argumentTone = tone;
    saveGame();

    const branch = {
      ferido: ["DANIEL: É só isso?", "ANTÔNIO: O que você quer que eu diga?"],
      direto: ["DANIEL: Você não liga?", "ANTÔNIO: Não começa."],
      fechado: ["DANIEL: Esquece.", "ANTÔNIO: Você que veio falar."]
    }[tone];

    this.dialog.showPages("", [
      ...branch,
      "DANIEL: Eu não sei por que ainda tento conversar com você.",
      "ANTÔNIO: Daniel...",
      "DANIEL: Não.",
      "DANIEL: Às vezes parece que tanto faz eu estar aqui ou não.",
      "ANTÔNIO: Você sempre fez o que quis."
    ], () => this.argumentEnd());
  }

  argumentEnd() {
    this.dialog.showPages("", [
      "Antônio percebe que falou algo errado.",
      "ANTÔNIO: Eu não quis—",
      "DANIEL: Deixa."
    ], () => {
      this.phase = 1;
      this.setObjective("Vá embora.");
    });
  }

  finishArgument() {
    this.phase = 2;
    SAVE.argumentMemorySeen = true;
    saveGame();
    this.showDataDialogue("argumentmemory_depois_disso_voces_continuaram_se_f_03", () => {
      this.cameras.main.fadeOut(900, 85, 69, 51);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.returnFromMemory("argument");
      });
    });
  }
}