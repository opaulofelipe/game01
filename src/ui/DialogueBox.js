import { W, C } from "../config/constants.js";
import { SETTINGS, textSizePx } from "../systems/SettingsSystem.js";
import { addDialogueHistory } from "../systems/SaveSystem.js";

export default class DialogueBox {
  constructor(scene) {
    this.scene = scene;
    this.visible = false;
    this.mode = null;
    this.pages = [];
    this.pageIndex = 0;
    this.callback = null;
    this.choices = [];
    this.selected = 0;
    this.typingEvent = null;
    this.typingDone = true;
    this.fullText = "";

    this.container = scene.add.container(0, 0).setDepth(1000).setScrollFactor(0);
    this.shadow = scene.add.rectangle(W / 2, 448, 870, 154, 0x000000, 0.30);
    this.panel = scene.add.rectangle(W / 2, 442, 870, 154, C.ink, 0.94)
      .setStrokeStyle(1, C.paper, 0.15);

    this.kicker = scene.add.text(78, 382, "", {
      fontFamily: "system-ui, sans-serif", fontSize: "14px", fontStyle: "bold",
      color: "#b99c76", letterSpacing: 1.5,
    });

    this.body = scene.add.text(78, 408, "", {
      fontFamily: "Georgia, serif", fontSize: "22px", color: "#e8dfd1",
      lineSpacing: 7, wordWrap: { width: 790 },
    });

    this.hint = scene.add.text(850, 500, "E  continuar", {
      fontFamily: "system-ui, sans-serif", fontSize: "12px", color: "#9f9588",
    }).setOrigin(1, 0.5);

    this.choiceContainer = scene.add.container(0, 0);
    this.container.add([this.shadow, this.panel, this.kicker, this.body, this.hint, this.choiceContainer]);
    this.container.setVisible(false);

    this.settingsHandler = () => this.applySettings();
    window.addEventListener('acasa-settings-changed', this.settingsHandler);
    scene.events.once('shutdown', () => window.removeEventListener('acasa-settings-changed', this.settingsHandler));
    this.applySettings();
  }

  applySettings() {
    const size = textSizePx();
    this.body.setFontSize(size);
    this.body.setFontFamily(SETTINGS.readableFont ? 'system-ui, sans-serif' : 'Georgia, serif');
    this.body.setLineSpacing(size >= 29 ? 10 : size >= 25 ? 9 : 7);
    this.panel.setFillStyle(SETTINGS.highContrast ? 0x050505 : C.ink, SETTINGS.highContrast ? 0.99 : 0.94);
    this.kicker.setColor(SETTINGS.highContrast ? '#f0c98e' : '#b99c76');
    this.body.setColor(SETTINGS.highContrast ? '#ffffff' : '#e8dfd1');
  }

  isOpen() { return this.visible; }

  showPages(kicker, pages, callback = null) {
    this.mode = "pages";
    this.pages = Array.isArray(pages) ? pages : [pages];
    this.pageIndex = 0;
    this.callback = callback;
    this.kicker.setText((kicker || "").toUpperCase());
    this.choiceContainer.removeAll(true);
    this.open();
    this.renderPage();
  }

  renderPage() {
    this.stopTyping();
    this.applySettings();
    this.fullText = String(this.pages[this.pageIndex] || "");
    addDialogueHistory(this.kicker.text, this.fullText);

    const speeds = { slow: 42, normal: 25, fast: 10, instant: 0 };
    const delay = speeds[SETTINGS.textSpeed] ?? 25;
    this.typingDone = delay === 0 || SETTINGS.reducedMotion;

    if (this.typingDone) {
      this.body.setText(this.fullText);
    } else {
      this.body.setText("");
      let i = 0;
      this.typingEvent = this.scene.time.addEvent({
        delay,
        repeat: Math.max(0, this.fullText.length - 1),
        callback: () => {
          i += 1;
          this.body.setText(this.fullText.slice(0, i));
          if (i >= this.fullText.length) this.typingDone = true;
        }
      });
    }
    this.updateHint();
  }

  updateHint() {
    if (this.pages.length > 1) this.hint.setText(`E  continuar   ${this.pageIndex + 1}/${this.pages.length}`);
    else this.hint.setText("E  continuar");
  }

  stopTyping() {
    if (this.typingEvent) { this.typingEvent.remove(false); this.typingEvent = null; }
  }

  revealNow() {
    this.stopTyping();
    this.body.setText(this.fullText);
    this.typingDone = true;
  }

  showChoice(kicker, prompt, choices) {
    this.stopTyping();
    this.mode = "choice";
    this.kicker.setText((kicker || "").toUpperCase());
    this.body.setText(prompt);
    this.choices = choices;
    this.selected = 0;
    this.choiceContainer.removeAll(true);
    this.hint.setText("← → escolher   •   E confirmar");
    addDialogueHistory(this.kicker.text, prompt);

    const count = choices.length;
    const totalWidth = Math.min(780, 210 * count);
    const gap = 10;
    const buttonWidth = (totalWidth - gap * (count - 1)) / count;
    const startX = W / 2 - totalWidth / 2;

    choices.forEach((choice, i) => {
      const x = startX + i * (buttonWidth + gap);
      const bg = this.scene.add.rectangle(x, 475, buttonWidth, 40, C.ink2, 0.96)
        .setOrigin(0, 0.5).setStrokeStyle(1, C.paper, 0.14).setInteractive({ useHandCursor: true });
      const label = this.scene.add.text(x + buttonWidth / 2, 475, choice.label, {
        fontFamily: "system-ui, sans-serif", fontSize: count > 3 ? "12px" : "14px",
        fontStyle: "bold", color: "#e8dfd1", align: 'center', wordWrap: { width: buttonWidth - 12 }
      }).setOrigin(0.5);
      bg.on("pointerup", () => this.choose(i));
      label.setInteractive({ useHandCursor: true }).on("pointerup", () => this.choose(i));
      this.choiceContainer.add([bg, label]);
    });

    this.open();
    this.paintChoice();
  }

  paintChoice() {
    if (this.mode !== "choice") return;
    const nodes = this.choiceContainer.list;
    for (let i = 0; i < this.choices.length; i++) {
      const bg = nodes[i * 2];
      const label = nodes[i * 2 + 1];
      const active = i === this.selected;
      bg.setFillStyle(active ? C.warmDark : C.ink2, active ? 1 : 0.96);
      bg.setStrokeStyle(1, C.paper, active ? 0.5 : 0.14);
      label.setColor(active ? "#fff7ea" : "#e8dfd1");
    }
  }

  moveChoice(dir) {
    if (!this.visible || this.mode !== "choice") return;
    this.selected = Phaser.Math.Wrap(this.selected + dir, 0, this.choices.length);
    this.paintChoice();
  }

  choose(index = this.selected) {
    if (!this.visible || this.mode !== "choice") return;
    const choice = this.choices[index];
    this.close();
    if (choice?.onSelect) choice.onSelect();
  }

  advance() {
    if (!this.visible) return false;
    if (this.mode === "choice") { this.choose(this.selected); return true; }
    if (!this.typingDone) { this.revealNow(); return true; }
    if (this.pageIndex < this.pages.length - 1) {
      this.pageIndex += 1; this.renderPage(); return true;
    }
    const cb = this.callback;
    this.close();
    if (cb) cb();
    return true;
  }

  open() { this.visible = true; this.container.setVisible(true); }
  close() {
    this.stopTyping();
    this.visible = false; this.mode = null; this.container.setVisible(false); this.choiceContainer.removeAll(true);
  }
}