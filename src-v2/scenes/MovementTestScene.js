import InputController from "../systems/InputController.js";
import Player from "../entities/Player.js";
import { createDanielTextures } from "../render/DanielSpriteFactory.js";

export default class MovementTestScene extends Phaser.Scene {
  constructor() {
    super("MovementTestScene");
    this.showHitbox = false;
  }

  create() {
    createDanielTextures(this);

    this.physics.world.setBounds(38, 70, 884, 430);
    this.cameras.main.setBackgroundColor("#211e1b");

    this.drawTestFloor();

    this.inputController = new InputController(this);
    this.player = new Player(this, 480, 300);

    this.debugGraphics = this.add.graphics().setDepth(999);

    this.info = this.add.text(24, 20, "", {
      fontFamily: "system-ui, sans-serif",
      fontSize: "13px",
      color: "#e8dfd1",
      backgroundColor: "rgba(23,21,19,.78)",
      padding: { x: 10, y: 7 }
    }).setDepth(1000);

    this.help = this.add.text(936, 20,
      "WASD / SETAS  •  mover\nH  •  mostrar hitbox dos pés",
      {
        fontFamily: "system-ui, sans-serif",
        fontSize: "12px",
        color: "#b99c76",
        align: "right"
      }
    ).setOrigin(1, 0).setDepth(1000);

    this.input.keyboard.on("keydown-H", () => {
      this.showHitbox = !this.showHitbox;
    });

    this.add.text(480, 95, "TESTE DE MOVIMENTAÇÃO", {
      fontFamily: "Georgia, serif",
      fontSize: "28px",
      color: "#e8dfd1"
    }).setOrigin(0.5);

    this.add.text(480, 126,
      "O objetivo aqui é validar Daniel antes de construir a casa.",
      {
        fontFamily: "system-ui, sans-serif",
        fontSize: "13px",
        color: "#9f8d75"
      }
    ).setOrigin(0.5);
  }

  drawTestFloor() {
    const g = this.add.graphics();

    g.fillStyle(0x2b2723, 1);
    g.fillRoundedRect(38, 70, 884, 430, 10);

    g.lineStyle(1, 0x3a342e, 0.7);
    for (let x = 80; x < 920; x += 48) g.lineBetween(x, 150, x, 500);
    for (let y = 150; y < 500; y += 48) g.lineBetween(38, y, 922, y);

    g.lineStyle(2, 0xb99c76, 0.16);
    g.strokeRoundedRect(38, 70, 884, 430, 10);

    g.lineStyle(2, 0xe8dfd1, 0.08);
    g.lineBetween(480, 150, 480, 500);
    g.lineBetween(38, 324, 922, 324);

    const markerColor = 0xb99c76;
    g.fillStyle(markerColor, 0.18);
    g.fillTriangle(480, 172, 465, 194, 495, 194);
    g.fillTriangle(480, 476, 465, 454, 495, 454);
    g.fillTriangle(65, 324, 87, 309, 87, 339);
    g.fillTriangle(895, 324, 873, 309, 873, 339);
  }

  update() {
    const vector = this.inputController.vector();
    this.player.update(vector);

    this.info.setText(
      `PASSO 2  •  direção: ${this.player.direction.toUpperCase()}  •  velocidade: ${this.player.speed} px/s`
    );

    this.debugGraphics.clear();

    if (this.showHitbox) {
      const body = this.player.footBounds;
      this.debugGraphics.lineStyle(2, 0x76d39b, 1);
      this.debugGraphics.strokeRect(body.x, body.y, body.width, body.height);
      this.debugGraphics.fillStyle(0x76d39b, 0.12);
      this.debugGraphics.fillRect(body.x, body.y, body.width, body.height);
    }
  }
}
