import { W, H, C } from "../config/constants.js";
import AudioSystem from "../systems/AudioSystem.js";
import { SAVE, resetSave } from "../systems/SaveSystem.js";
import { SETTINGS } from "../systems/SettingsSystem.js";

export default class TitleScene extends Phaser.Scene {
  constructor() { super("TitleScene"); }

  create() {
    document.getElementById("pause-btn")?.classList.add("hidden");
    this.cameras.main.setBackgroundColor(C.ink);
    this.audio = new AudioSystem(this);
    this.audio.setupForScene();

    const g = this.add.graphics();
    // Fachada estilizada ao entardecer — arte final procedural leve.
    g.fillGradientStyle(0x6e5f55, 0x6e5f55, 0x201d1b, 0x201d1b, 1);
    g.fillRect(0,0,W,H);
    g.fillStyle(0x262a24,1); g.fillRect(0,360,W,180);
    g.fillStyle(0x4f463d,1); g.fillRect(250,170,460,230);
    g.fillStyle(0x332d28,1); g.fillTriangle(220,180,740,180,480,78);
    g.fillStyle(0x7b6550,1); g.fillRect(450,270,62,130);
    g.fillStyle(0x2e3940,1); g.fillRect(304,228,92,66); g.fillRect(570,228,92,66);
    g.lineStyle(3,0xb8a78d,.45); g.strokeRect(304,228,92,66); g.strokeRect(570,228,92,66);
    g.fillStyle(0x171513,.42); g.fillCircle(150,205,125); g.fillCircle(830,225,145);
    if (SAVE.endingSeen) { g.fillStyle(0x11100f,.36); g.fillRect(250,170,460,230); }

    this.add.text(W / 2, 112, "A CASA", {
      fontFamily: "Georgia, serif", fontSize: "58px", color: "#e8dfd1", letterSpacing: 8,
    }).setOrigin(0.5);
    this.add.text(W / 2, 166, "um jogo sobre aquilo que ficou", {
      fontFamily: "Georgia, serif", fontSize: "17px", fontStyle: "italic", color: "#c7bbaa",
    }).setOrigin(0.5);

    const hasProgress = SAVE.hasEnteredHouse || SAVE.photoSeen || SAVE.boxSorted || SAVE.backyardVisited;
    const label = SAVE.endingSeen ? "REVER EPÍLOGO" : (hasProgress ? "CONTINUAR" : "NOVO JOGO");
    this.makeButton(W/2, 274, label, () => this.startGame(false));
    if (hasProgress && !SAVE.endingSeen) this.makeButton(W/2, 326, "NOVO JOGO", () => this.confirmNewGame(), true);
    this.makeButton(W/2, hasProgress && !SAVE.endingSeen ? 378 : 326, "CONFIGURAÇÕES", () => window.ACasaUI?.openSettings(this, false), true);
    this.makeButton(W/2, hasProgress && !SAVE.endingSeen ? 430 : 378, "CRÉDITOS", () => window.ACasaUI?.openCredits(this, false), true);

    this.add.text(W / 2, 508, "WASD / setas • E para interagir • Esc para pausar", {
      fontFamily: "system-ui, sans-serif", fontSize: "11px", color: "#8b8074",
    }).setOrigin(0.5);

    if (!SETTINGS.reducedMotion) this.cameras.main.fadeIn(650, 20, 18, 16);
    this.events.once('shutdown', () => this.audio?.destroy());
  }

  makeButton(x, y, label, cb, secondary = false) {
    const bg = this.add.rectangle(x, y, 250, 42, secondary ? 0x27221e : C.warmDark, .96)
      .setStrokeStyle(1, C.paper, secondary ? 0.12 : 0.28).setInteractive({ useHandCursor: true });
    const tx = this.add.text(x, y, label, {
      fontFamily: "system-ui, sans-serif", fontSize: "13px", fontStyle: "bold", color: "#f2e9dc", letterSpacing: 1.1,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    const over = () => bg.setFillStyle(secondary ? 0x39322c : 0x887054);
    const out = () => bg.setFillStyle(secondary ? 0x27221e : C.warmDark);
    bg.on('pointerover', over).on('pointerout', out).on('pointerup', cb); tx.on('pointerup', cb);
  }

  confirmNewGame() {
    const yes = () => { resetSave(); this.startGame(false); };
    // Modal DOM simples para evitar perder o save por clique acidental.
    const ui = window.ACasaUI;
    if (!ui) return yes();
    ui.activeScene = this;
    ui.panel.innerHTML = `<div class="overlay-head"><span>NOVO JOGO</span><button data-action="close">×</button></div><p>Começar um novo jogo? O progresso atual será substituído.</p><button id="new-game-yes" class="menu-button primary">Novo jogo</button><button class="menu-button" data-action="close">Cancelar</button>`;
    ui.open();
    document.getElementById('new-game-yes')?.addEventListener('click', () => { ui.close(false); yes(); }, { once:true });
  }

  startGame(newGame) {
    if (newGame) resetSave();
    const go = () => {
      if (SAVE.endingSeen) this.scene.start("EpilogueScene");
      else if (SAVE.closingStarted) this.scene.start("ClosingScene");
      else this.scene.start(SAVE.hasEnteredHouse ? "RoomScene" : "ExteriorScene");
    };
    if (SETTINGS.reducedMotion) return go();
    this.cameras.main.fadeOut(420, 20, 18, 16); this.cameras.main.once("camerafadeoutcomplete", go);
  }
}