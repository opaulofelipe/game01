import { W, H, C } from "../config/constants.js";
import BaseScene from "./BaseScene.js";
import GameData from "../systems/GameData.js";
import { SAVE, saveGame, resetSave, markInspected } from "../systems/SaveSystem.js";
import { dist, coreStoryComplete, storyProgress } from "../utils/helpers.js";

export default class ExteriorScene extends BaseScene {
  constructor() {
    super("ExteriorScene");
    this.nearDoor = false;
  }

  create() {
    this.cameras.main.setBackgroundColor(0x29302a);
    this.physics.world.setBounds(0, 0, W, H);
    this.drawExterior();
    this.bindMovementKeys();
    this.createUI("");

    this.add.text(28, 472, "WASD / SETAS  mover\nE  interagir", {
      fontFamily: "system-ui, sans-serif",
      fontSize: "11px",
      color: "#d7cdbf",
      lineSpacing: 5,
      backgroundColor: "rgba(23,21,19,0.58)",
      padding: { x: 9, y: 7 },
    }).setDepth(80);

    this.player = this.physics.add.sprite(W / 2, 458, "daniel");
    this.player.body.setSize(18, 22).setOffset(5, 12);
    this.player.setCollideWorldBounds(true);

    // Limits da casa e jardim.
    [
      [180, 135, 38, 250], [780, 135, 38, 250],
      [480, 30, 638, 34],
      [320, 260, 130, 48], [640, 260, 130, 48],
    ].forEach(o => this.physics.add.collider(this.player, this.makeObstacle(...o)));

    this.doorZone = { x: W / 2, y: 188 };
    this.cameras.main.fadeIn(700, 20, 18, 16);
  }

  drawExterior() {
    const g = this.add.graphics();

    // gramado
    g.fillStyle(0x344036, 1);
    g.fillRect(0, 0, W, H);

    // caminho
    g.fillStyle(0x857a69, 1);
    g.fillRoundedRect(430, 205, 100, 335, 16);

    // casa
    g.fillStyle(0x63594e, 1);
    g.fillRect(190, 45, 580, 230);
    g.fillStyle(0x312c28, 1);
    g.fillTriangle(165, 65, 795, 65, 480, -26);

    // fachada
    g.fillStyle(0x76695b, 1);
    g.fillRect(208, 78, 544, 180);

    // janelas
    g.fillStyle(0x25343b, 1);
    g.fillRect(255, 115, 105, 78);
    g.fillRect(600, 115, 105, 78);
    g.lineStyle(3, 0xb0a28f, 0.7);
    g.strokeRect(255, 115, 105, 78);
    g.strokeRect(600, 115, 105, 78);
    g.lineBetween(307, 115, 307, 193);
    g.lineBetween(652, 115, 652, 193);

    // porta
    g.fillStyle(C.wood, 1);
    g.fillRect(440, 112, 80, 146);
    g.fillStyle(C.warm, 1);
    g.fillCircle(503, 188, 4);

    // canteiros
    g.fillStyle(0x29342c, 1);
    g.fillRoundedRect(245, 236, 150, 42, 12);
    g.fillRoundedRect(565, 236, 150, 42, 12);

    for (const x of [260, 286, 315, 345, 374, 580, 610, 640, 670, 700]) {
      g.fillStyle(0x55604d, 1);
      g.fillCircle(x, 244 + (x % 14), 13);
    }

    // árvores laterais
    for (const [x, y, r] of [[80,100,50],[90,210,62],[875,115,56],[875,255,68]]) {
      g.fillStyle(0x202c25, 1);
      g.fillCircle(x, y, r);
      g.fillStyle(0x3f4b3e, 0.9);
      g.fillCircle(x - 10, y - 9, r * 0.74);
    }

    const introText = this.add.text(480, 312, "A casa parece menor do que na memória.", {
      fontFamily: "Georgia, serif",
      fontSize: "16px",
      fontStyle: "italic",
      color: "#bfb5a7",
    }).setOrigin(0.5).setAlpha(0.0);

    this.time.delayedCall(900, () => {
      this.tweens.add({
        targets: introText,
        alpha: 1,
        duration: 800,
        yoyo: true,
        hold: 2300,
        onComplete: () => introText.destroy()
      });
    });
  }

  update() {
    if (!this.player) return;

    const v = this.controlsVector();
    const speed = 160;
    this.player.setVelocity(v.x * speed, v.y * speed);

    this.nearDoor = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.doorZone.x, this.doorZone.y) < 74;
    if (this.nearDoor && !this.dialog.isOpen()) {
      this.showPrompt("E  •  entrar");
    } else if (!this.dialog.isOpen()) {
      this.hidePrompt();
    }
  }

  handleAction() {
    if (this.dialog?.isOpen()) return super.handleAction();

    if (this.nearDoor) {
      this.showDataDialogue("exterior_a_chave_ainda_prende_um_pouco_antes_01", () => {
        SAVE.hasEnteredHouse = true;
        saveGame();
        this.fadeTo("RoomScene", { firstEntry: true });
      });
    }
  }
}