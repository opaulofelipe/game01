import { W, H, C } from "../config/constants.js";
import BaseScene from "./BaseScene.js";
import GameData from "../systems/GameData.js";
import { SAVE, saveGame, resetSave, markInspected } from "../systems/SaveSystem.js";
import { dist, coreStoryComplete, storyProgress } from "../utils/helpers.js";

export default class RoomScene extends BaseScene {
  constructor() {
    super("RoomScene");
    this.nearest = null;
    this.radioSound = null;
  }

  create(data = {}) {
    this.physics.world.setBounds(20, 20, W - 40, H - 40);
    this.cameras.main.setBackgroundColor(C.wallDark);
    this.drawRoom();
    this.bindMovementKeys();
    this.createUI(coreStoryComplete()
      ? "OBJETIVO  •  Termine de fechar a casa."
      : "OBJETIVO  •  Organize a casa.");

    let roomStartX = 480;
    let roomStartY = 455;
    if (data.fromKitchen) { roomStartX = 850; roomStartY = 294; }
    if (data.fromGarage) { roomStartX = 82; roomStartY = 395; }
    if (data.fromBedroom) { roomStartX = 700; roomStartY = 105; }
    if (data.fromDanielRoom) { roomStartX = 320; roomStartY = 105; }
    if (data.fromYard) { roomStartX = 480; roomStartY = 455; }

    this.player = this.physics.add.sprite(roomStartX, roomStartY, "daniel");
    this.player.body.setSize(18, 22).setOffset(5, 12);
    this.player.setCollideWorldBounds(true);

    this.obstacles = [];
    [
      [480, 522, 960, 36],    // parede inferior
      [16, 270, 32, 540],     // parede esquerda
      [944, 270, 32, 540],    // parede direita
      [480, 14, 960, 28],     // parede superior
      [455, 285, 220, 82],    // sofá
      [470, 360, 118, 54],    // mesa de centro
      [160, 93, 180, 62],     // estante
      [820, 176, 140, 54],    // aparador rádio
      [820, 424, 110, 80],    // caixa
      [92, 300, 78, 110],     // cabideiro
    ].forEach(o => {
      const z = this.makeObstacle(...o);
      this.physics.add.collider(this.player, z);
      this.obstacles.push(z);
    });

    this.makeInteractables();

    if (SAVE.radioOn) this.startRadio();

    this.cameras.main.fadeIn(650, 20, 18, 16);

    if (data.firstEntry) {
      this.time.delayedCall(550, () => {
        this.showDataDialogue("room_a_casa_esta_exatamente_como_ele_dei_01");
      });
    } else if (data.returnFromMemory) {
      this.time.delayedCall(500, () => {
        this.setObjective("OBJETIVO  •  Continue no seu ritmo.");
      });
    }

    this.events.once("shutdown", () => {
      if (this.radioSound) {
        this.radioSound.stop();
        this.radioSound.destroy();
        this.radioSound = null;
      }
    });
  }

  drawRoom() {
    const g = this.add.graphics();

    // paredes
    g.fillStyle(C.wallDark, 1);
    g.fillRect(0, 0, W, H);

    // piso de madeira
    g.fillStyle(C.floor, 1);
    g.fillRect(30, 30, 900, 480);
    for (let y = 30; y < 510; y += 30) {
      g.lineStyle(1, C.floor2, 0.38);
      g.lineBetween(30, y, 930, y);
      const offset = ((y / 30) % 2) * 72;
      for (let x = 30 + offset; x < 930; x += 145) {
        g.lineBetween(x, y, x, y + 30);
      }
    }

    // rodapé e paredes internas
    g.fillStyle(C.wall, 1);
    g.fillRect(20, 20, 920, 20);
    g.fillRect(20, 20, 20, 500);
    g.fillRect(920, 20, 20, 500);
    g.fillRect(20, 500, 380, 20);
    g.fillRect(560, 500, 380, 20);

    // porta de entrada aberta na parte inferior
    g.fillStyle(0x211e1b, 1);
    g.fillRect(400, 500, 160, 20);
    g.lineStyle(3, C.woodLight, 0.8);
    g.lineBetween(402, 501, 402, 464);
    g.lineBetween(558, 501, 558, 464);

    // passagem para a cozinha
    g.fillStyle(0x211e1b, 1);
    g.fillRect(918, 235, 22, 118);
    g.lineStyle(3, C.woodLight, 0.75);
    g.lineBetween(918, 236, 884, 236);
    g.lineBetween(918, 352, 884, 352);
    this.add.text(900, 294, "COZINHA", {
      fontFamily: "system-ui, sans-serif",
      fontSize: "9px",
      fontStyle: "bold",
      color: "#a99d8f",
      angle: -90,
    }).setOrigin(0.5);

    // passagem para a oficina / garagem
    g.fillStyle(0x211e1b, 1);
    g.fillRect(20, 346, 22, 110);
    g.lineStyle(3, C.woodLight, 0.75);
    g.lineBetween(42, 347, 70, 347);
    g.lineBetween(42, 455, 70, 455);
    this.add.text(58, 401, "OFICINA", {
      fontFamily: "system-ui, sans-serif",
      fontSize: "9px",
      fontStyle: "bold",
      color: "#a99d8f",
      angle: 90,
    }).setOrigin(0.5);

    // porta para o quarto de Antônio
    g.fillStyle(0x211e1b, 1);
    g.fillRect(650, 20, 100, 22);
    g.lineStyle(3, C.woodLight, 0.75);
    g.lineBetween(651, 42, 651, 72);
    g.lineBetween(749, 42, 749, 72);
    this.add.text(700, 58, "QUARTO", {
      fontFamily: "system-ui, sans-serif",
      fontSize: "9px",
      fontStyle: "bold",
      color: "#a99d8f",
    }).setOrigin(0.5);

    // porta para o antigo quarto de Daniel
    g.fillStyle(0x211e1b, 1);
    g.fillRect(270, 20, 100, 22);
    g.lineStyle(3, C.woodLight, 0.75);
    g.lineBetween(271, 42, 271, 72);
    g.lineBetween(369, 42, 369, 72);
    this.add.text(320, 58, "QUARTO DE DANIEL", {
      fontFamily: "system-ui, sans-serif",
      fontSize: "8px",
      fontStyle: "bold",
      color: "#a99d8f",
    }).setOrigin(0.5);

    // janela
    g.fillStyle(0x40505a, 1);
    g.fillRect(392, 36, 176, 44);
    g.lineStyle(3, 0xc4b8a6, 0.55);
    g.strokeRect(392, 36, 176, 44);
    g.lineBetween(480, 36, 480, 80);

    // tapete
    g.fillStyle(0x827568, 0.85);
    g.fillRoundedRect(328, 244, 300, 180, 12);
    g.lineStyle(2, 0xb7a58d, 0.22);
    g.strokeRoundedRect(343, 259, 270, 150, 10);

    // sofá
    g.fillStyle(C.sofa, 1);
    g.fillRoundedRect(345, 245, 220, 78, 15);
    g.fillStyle(0x59635d, 1);
    g.fillRoundedRect(358, 258, 92, 46, 10);
    g.fillRoundedRect(460, 258, 92, 46, 10);

    // mesa de centro
    g.fillStyle(C.wood, 1);
    g.fillRoundedRect(411, 336, 118, 48, 7);

    // estante
    g.fillStyle(C.wood, 1);
    g.fillRect(70, 44, 180, 100);
    for (let y of [70, 98, 126]) {
      g.fillStyle(0x3c3028, 1);
      g.fillRect(76, y, 168, 5);
    }
    // livros
    const bookColors = [0x6c7463, 0x8a665a, 0x6a7880, 0x8a7b5e, 0x5d5a64];
    const progress = storyProgress();
    const visibleBooks = Math.max(2, 10 - Math.floor(progress * 8));
    for (let i = 0; i < visibleBooks; i++) {
      g.fillStyle(bookColors[i % bookColors.length], 1);
      g.fillRect(82 + i * 14, 48, 9, 20 + (i % 4) * 3);
    }

    // Conforme Daniel organiza a casa, caixas fechadas aparecem perto da saída
    // e pequenos vazios começam a substituir a desordem inicial.
    const packedBoxes = Math.floor(progress * 4);
    for (let i = 0; i < packedBoxes; i++) {
      const bx = 585 + (i % 2) * 58;
      const by = 445 - Math.floor(i / 2) * 45;
      g.fillStyle(0x8e724f, 1);
      g.fillRect(bx, by, 48, 36);
      g.lineStyle(1, 0x5f4a34, 0.6);
      g.strokeRect(bx, by, 48, 36);
      g.lineBetween(bx + 24, by, bx + 24, by + 36);
    }
    if (progress > 0.72) {
      g.lineStyle(2, 0xc9baa4, 0.14);
      g.strokeRect(115, 161, 86, 54);
      g.strokeRect(704, 264, 72, 48);
    }

    // aparador
    g.fillStyle(C.woodLight, 1);
    g.fillRoundedRect(750, 150, 140, 52, 6);
    g.fillStyle(C.wood, 1);
    g.fillRect(762, 198, 8, 36);
    g.fillRect(870, 198, 8, 36);

    // rádio
    g.fillStyle(0x34302c, 1);
    g.fillRoundedRect(792, 125, 58, 34, 5);
    g.fillStyle(0x94866f, 1);
    g.fillCircle(806, 142, 8);
    g.lineStyle(1, 0xb9a78c, 0.6);
    g.strokeRect(820, 132, 22, 14);
    if (SAVE.radioOn) {
      this.add.text(852, 126, "♪", {
        fontFamily: "Georgia, serif",
        fontSize: "20px",
        color: "#d8c7aa",
      }).setAlpha(0.8);
    }

    // fotografia na estante
    g.fillStyle(0x9a8060, 1);
    g.fillRect(182, 78, 38, 46);
    g.fillStyle(0xb7ab99, 1);
    g.fillRect(187, 83, 28, 35);
    g.fillStyle(0x746a60, 1);
    g.fillCircle(196, 94, 5);
    g.fillCircle(207, 94, 5);

    // caixa de papelão
    g.fillStyle(0x8e724f, 1);
    g.fillRect(765, 388, 110, 72);
    g.lineStyle(2, 0x5f4a34, 0.55);
    g.strokeRect(765, 388, 110, 72);
    g.lineBetween(820, 388, 820, 460);
    g.fillStyle(0xd2c3a9, 1);
    g.fillRect(785, 414, 70, 20);

    this.boxLabel = this.add.text(820, 424, SAVE.boxSorted ? "SEPARADO" : "SEPARAR", {
      fontFamily: "system-ui, sans-serif",
      fontSize: "9px",
      fontStyle: "bold",
      color: "#574638",
    }).setOrigin(0.5);

    // cabideiro + casaco
    g.lineStyle(7, C.wood, 1);
    g.lineBetween(92, 215, 92, 350);
    g.lineBetween(70, 240, 114, 240);
    g.fillStyle(0x555e63, 1);
    g.fillRoundedRect(64, 244, 56, 72, 8);

    // planta
    g.fillStyle(0x715c45, 1);
    g.fillRoundedRect(845, 70, 42, 42, 6);
    for (const [x,y] of [[850,62],[866,52],[881,61],[858,43],[878,42]]) {
      g.fillStyle(C.green, 1);
      g.fillEllipse(x, y, 18, 30);
    }

    // correspondências
    g.fillStyle(0xd9d1c4, 1);
    g.fillRect(62, 401, 76, 44);
    g.lineStyle(1, 0x8e8376, 0.55);
    g.lineBetween(62, 401, 100, 425);
    g.lineBetween(138, 401, 100, 425);

    // jornal
    g.fillStyle(0xd7d0c4, 1);
    g.fillRect(280, 172, 60, 38);
    g.lineStyle(1, 0x7f766d, 0.6);
    g.lineBetween(287, 181, 333, 181);
    g.lineBetween(287, 187, 333, 187);
    g.lineBetween(287, 193, 320, 193);

    // óculos
    g.lineStyle(2, 0x3d3935, 1);
    g.strokeCircle(362, 188, 9);
    g.strokeCircle(382, 188, 9);
    g.lineBetween(371, 188, 373, 188);

    // controle remoto
    g.fillStyle(0x33302d, 1);
    g.fillRoundedRect(457, 345, 22, 42, 5);
    g.fillStyle(0xb7a88f, 0.8);
    g.fillCircle(468, 354, 2);

    // livro solto
    g.fillStyle(0x6f6254, 1);
    g.fillRoundedRect(217, 114, 28, 42, 3);
    g.lineStyle(2, 0xc4b89f, 0.35);
    g.lineBetween(223, 120, 223, 150);
  }

  makeInteractables() {
    this.interactables = [
      this.objectFromData("radio", () => this.interactRadio()),
      this.objectFromData("foto", () => this.interactPhoto()),
      this.objectFromData("caixa", () => this.interactBox()),
      this.objectFromData("jornal"),
      this.objectFromData("oculos"),
      this.objectFromData("controle"),
      this.objectFromData("cartas"),
      this.objectFromData("casaco"),
      this.objectFromData("planta"),
      this.objectFromData("livro"),
      this.objectFromData("cozinha", () => this.roomExit("living_room", "kitchen")),
      this.objectFromData("oficina", () => this.roomExit("living_room", "workshop")),
      this.objectFromData("quarto", () => this.roomExit("living_room", "antonio_bedroom")),
      this.objectFromData("quarto_daniel", () => this.roomExit("living_room", "daniel_bedroom")),
      this.objectFromData("porta_final", () => this.interactFrontDoor(), {
        label: coreStoryComplete() ? "começar a fechar a casa" : "porta de entrada"
      }),
      ...this.optionalObjects("living_room"),
    ];

    this.interactables.forEach(item => {
      const s = this.add.image(item.x, item.y - 30, "spark")
        .setAlpha(0.0)
        .setDepth(30);
      item.spark = s;
      this.tweens.add({
        targets: s,
        y: s.y - 5,
        alpha: { from: 0.22, to: 0.7 },
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

  interactRadio() {
    markInspected("radio");

    if (SAVE.radioOn) {
      this.showDataChoice("radio_when_on", {
        leave_on: () => {},
        turn_off: () => {
          SAVE.radioOn = false;
          saveGame();
          if (this.radioSound) {
            this.radioSound.stop();
            this.radioSound.destroy();
            this.radioSound = null;
          }
        }
      });
      return;
    }

    this.showDataDialogue("room_radio_02", () => {
      this.showDataChoice("radio_initial", {
        turn_on: () => {
          SAVE.radioOn = true;
          saveGame();
          this.startRadio();
        },
        leave_off: () => {}
      });
    });
  }

  startRadio() {
    if (this.radioSound) return;
    this.radioSound = this.audio?.playAmbience("radio_static", { volume: 0.32 }, "rádio tocando baixo") || null;
  }

  interactBox() {
    markInspected("caixa");

    if (SAVE.boxSorted) {
      const labels = {
        guardar: "guardar",
        doar: "doar",
        descartar: "descartar",
        deixar: "deixar onde estavam",
      };
      this.dialog.showPages("CAIXA", [
        `As revistas antigas foram separadas para ${labels[SAVE.boxDecision] || "resolver depois"}.`,
        "A caixa ainda tem muito espaço."
      ]);
      return;
    }

    this.showDataDialogue("room_caixa_03", () => {
      this.showDataChoice("magazines_destination", {
        keep: () => this.finishSort("guardar"),
        donate: () => this.finishSort("doar"),
        discard: () => this.finishSort("descartar"),
        leave: () => this.finishSort("deixar")
      });
    });
  }

  finishSort(decision) {
    SAVE.boxSorted = true;
    SAVE.boxDecision = decision;
    saveGame();
    if (this.boxLabel) this.boxLabel.setText("SEPARADO");

    const responses = {
      guardar: "Você coloca as revistas na caixa de coisas que vão com você.",
      doar: "Você coloca as revistas na pilha de doação.",
      descartar: "Você coloca as revistas junto ao material para descarte.",
      deixar: "Você deixa as revistas onde estavam por enquanto."
    };

    this.dialog.showPages("", [
      responses[decision],
      "É uma decisão pequena. Mesmo assim, demora mais do que deveria."
    ]);
  }

  interactPhoto() {
    markInspected("foto");

    if (SAVE.photoSeen) {
      this.showDataDialogue("room_fotografia_04");
      return;
    }

    this.showDataDialogue("room_fotografia_05", () => {
      this.showDataChoice("photo_examine", {
        remember: () => {
          if (this.radioSound) this.radioSound.stop();
          this.fadeTo(this.memoryScene("car"));
        },
        later: () => {}
      });
    });
  }

  interactFrontDoor() {
    if (!coreStoryComplete()) {
      this.showDataDialogue("room_porta_06");
      return;
    }

    this.showDataChoice("room_porta_01", { option_1: () => {
          if (this.radioSound) this.radioSound.stop();
          SAVE.radioOn = false;
          SAVE.closingStarted = true;
          saveGame();
          this.fadeTo("ClosingScene");
        }, option_2: () => {} });
  }

  update() {
    if (!this.player) return;

    const v = this.controlsVector();
    const speed = 150;
    this.player.setVelocity(v.x * speed, v.y * speed);

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

    this.nearest = bestD < this.interactionRadius(74) ? best : null;

    if (this.nearest) {
      this.showPrompt(`E  •  ${this.nearest.label}`);
    } else {
      this.hidePrompt();
    }
  }

  handleAction() {
    if (this.dialog?.isOpen()) return super.handleAction();
    if (this.nearest) this.nearest.action();
  }
}