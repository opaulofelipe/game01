export default class FoundationScene extends Phaser.Scene {
  constructor() {
    super("FoundationScene");
  }

  create() {
    this.cameras.main.setBackgroundColor("#211e1b");

    this.add.text(480, 220, "A CASA", {
      fontFamily: "Georgia, serif",
      fontSize: "54px",
      color: "#e8dfd1"
    }).setOrigin(0.5);

    this.add.text(480, 286, "RECONSTRUÇÃO V2", {
      fontFamily: "system-ui, sans-serif",
      fontSize: "16px",
      fontStyle: "bold",
      color: "#b99c76",
      letterSpacing: 2
    }).setOrigin(0.5);

    this.add.text(480, 330, "Base limpa criada. Nenhuma cena antiga está em execução.", {
      fontFamily: "system-ui, sans-serif",
      fontSize: "15px",
      color: "#9f8d75"
    }).setOrigin(0.5);
  }
}
